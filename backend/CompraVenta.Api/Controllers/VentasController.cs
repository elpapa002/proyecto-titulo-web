using System.Data;
using System.Text.RegularExpressions;
using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/ventas")]
    public class VentasController : ControllerBase
    {
        private static readonly List<string> EstadosPedido = new List<string> { "Pagado", "En preparación", "Enviado", "Entregado", "Cancelado" };
        private static readonly List<string> EstadosTransaccion = new List<string> { "Pendiente", "Completada", "Cancelada" };

        private readonly AppDbContext _context;
        public VentasController(AppDbContext context) => _context = context;

        private IQueryable<Venta> ConsultaVentas()
        {
            return _context.Ventas
                .Include(v => v.Detalles)
                .Include(v => v.Cliente)
                .Include(v => v.Vendedor).ThenInclude(u => u.Compania);
        }

        [HttpGet("/api/clientes/{clienteId}/compras")]
        public async Task<IActionResult> GetComprasCliente(int clienteId)
        {
            if (await _context.Usuarios.FindAsync(clienteId) is null)
                return NotFound(RespuestaApi.Error("Cliente no encontrado."));

            var ventas = await ConsultaVentas()
                .Where(v => v.ClienteId == clienteId)
                .OrderByDescending(v => v.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Compras obtenidas.", ventas.Select(Mapeo.DeVenta).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/ventas")]
        public async Task<IActionResult> GetVentasVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var ventas = await ConsultaVentas()
                .Where(v => v.VendedorId == vendedorId)
                .OrderByDescending(v => v.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Ventas obtenidas.", ventas.Select(Mapeo.DeVenta).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVenta(int id)
        {
            var venta = await ConsultaVentas().FirstOrDefaultAsync(v => v.Id == id);
            if (venta is null) return NotFound(RespuestaApi.Error("No existe la venta."));
            return Ok(RespuestaApi.Exito("Venta encontrada.", Mapeo.DeVenta(venta)));
        }

        [HttpPost]
        public async Task<IActionResult> CrearVenta(VentaCrearDto datos)
        {
            var errores = new List<string>();
            if (datos.Items.Any(i => i.ProductoId == null)) errores.Add("Cada producto de la compra debe indicar su productoId.");
            else if (datos.Items.Select(i => i.ProductoId).Distinct().Count() != datos.Items.Count) errores.Add("Hay productos repetidos en la compra.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead);

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));
            if (!cliente.EsCliente) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Cliente."));

            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (datos.ClienteId == datos.VendedorId) return Conflict(RespuestaApi.Error("No puedes comprar tus propias publicaciones."));

            var ids = datos.Items.Select(i => i.ProductoId.Value).ToList();
            var productos = await _context.Productos
                .Include(p => p.Ofertas)
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            foreach (var item in datos.Items)
            {
                var producto = productos.FirstOrDefault(p => p.Id == item.ProductoId);
                if (producto is null) return NotFound(RespuestaApi.Error($"El producto {item.ProductoId} no existe."));
                if (producto.VendedorId != datos.VendedorId) return Conflict(RespuestaApi.Error($"{producto.Nombre} no pertenece a este vendedor."));
                if (producto.Estado != "Publicada") return Conflict(RespuestaApi.Error($"{producto.Nombre} no está disponible para la venta."));
                if (producto.Stock < item.Cantidad) return Conflict(RespuestaApi.Error($"No hay stock suficiente de {producto.Nombre}."));
            }

            var detalles = new List<DetalleVenta>();
            var subtotal = 0;
            foreach (var item in datos.Items)
            {
                var producto = productos.First(p => p.Id == item.ProductoId);
                var oferta = Mapeo.OfertaVigente(producto);
                var precio = oferta == null ? producto.Precio : oferta.PrecioOferta;
                producto.Stock -= item.Cantidad;
                subtotal += precio * item.Cantidad;
                detalles.Add(new DetalleVenta { ProductoId = producto.Id, Nombre = producto.Nombre, Cantidad = item.Cantidad, Precio = precio });
            }

            var venta = new Venta
            {
                ClienteId = datos.ClienteId,
                VendedorId = datos.VendedorId,
                Fecha = Validaciones.Hoy(),
                Envio = datos.Envio,
                Total = subtotal + datos.Envio,
                MedioTipo = datos.MedioPago.Tipo.Trim(),
                MedioMarca = (datos.MedioPago.Marca ?? "").Trim(),
                MedioUltimos4 = string.IsNullOrEmpty(datos.MedioPago.Ultimos4) ? null : datos.MedioPago.Ultimos4,
                EstadoTransaccion = "Completada",
                EstadoPedido = "Pagado",
                Direccion = datos.Direccion.Trim(),
                EmpresaTransporte = "",
                Seguimiento = "",
                Calificada = false
            };
            _context.Ventas.Add(venta);

            try
            {
                await _context.SaveChangesAsync();

                foreach (var detalle in detalles)
                {
                    detalle.VentaId = venta.Id;
                    _context.DetallesVenta.Add(detalle);
                }

                _context.Notificaciones.Add(new Notificacion
                {
                    UsuarioId = venta.VendedorId,
                    Texto = $"Tienes una venta nueva, la {venta.Id}.",
                    Fecha = Validaciones.Hoy(),
                    Leida = false,
                    Ruta = $"/mi-tienda/ventas/{venta.Id}"
                });

                await _context.SaveChangesAsync();
                await transaccion.CommitAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(RespuestaApi.Error("No se pudo completar la compra porque el stock cambió. Intenta de nuevo."));
            }

            var creada = await ConsultaVentas().FirstAsync(v => v.Id == venta.Id);
            return Created($"/api/ventas/{venta.Id}", RespuestaApi.Exito("Compra realizada.", Mapeo.DeVenta(creada)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPedido(int id, VentaEditarDto datos)
        {
            var venta = await ConsultaVentas().FirstOrDefaultAsync(v => v.Id == id);
            if (venta is null) return NotFound(RespuestaApi.Error("No existe la venta."));

            var errores = new List<string>();
            if (datos.EstadoPedido != null && !EstadosPedido.Contains(datos.EstadoPedido))
                errores.Add("El estado del pedido debe ser Pagado, En preparación, Enviado, Entregado o Cancelado.");
            if (datos.EstadoTransaccion != null && !EstadosTransaccion.Contains(datos.EstadoTransaccion))
                errores.Add("El estado de la transacción debe ser Pendiente, Completada o Cancelada.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            if (venta.EstadoPedido == "Cancelado" || venta.EstadoPedido == "Entregado")
                return Conflict(RespuestaApi.Error($"El pedido ya está {venta.EstadoPedido.ToLower()} y no se puede modificar."));
            if (datos.EstadoPedido != null && datos.EstadoPedido != "Cancelado" && EstadosPedido.IndexOf(datos.EstadoPedido) < EstadosPedido.IndexOf(venta.EstadoPedido))
                return Conflict(RespuestaApi.Error("No puedes volver a un estado anterior del pedido."));

            if (datos.EmpresaTransporte != null) venta.EmpresaTransporte = datos.EmpresaTransporte.Trim();
            if (datos.Seguimiento != null) venta.Seguimiento = datos.Seguimiento.Trim().ToUpper();
            if (datos.EstadoTransaccion != null) venta.EstadoTransaccion = datos.EstadoTransaccion;

            if (datos.EstadoPedido != null)
            {
                if (datos.EstadoPedido == "Enviado" || datos.EstadoPedido == "Entregado")
                {
                    if (venta.EmpresaTransporte == "" || !Regex.IsMatch(venta.Seguimiento, "^[A-Z0-9-]{5,30}$"))
                        return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "Para un pedido enviado o entregado indica la empresa de transporte y un seguimiento de 5 a 30 letras, números o guion." }));
                }

                if (datos.EstadoPedido == "Cancelado")
                {
                    var ids = venta.Detalles.Where(d => d.ProductoId != null).Select(d => d.ProductoId.Value).ToList();
                    var productos = await _context.Productos.Where(p => ids.Contains(p.Id)).ToListAsync();
                    foreach (var detalle in venta.Detalles)
                    {
                        var producto = productos.FirstOrDefault(p => p.Id == detalle.ProductoId);
                        if (producto != null) producto.Stock += detalle.Cantidad;
                    }
                    venta.EstadoTransaccion = "Cancelada";
                }

                venta.EstadoPedido = datos.EstadoPedido;
            }

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = venta.ClienteId,
                Texto = $"Tu pedido {venta.Id} cambió a '{venta.EstadoPedido}'.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = $"/tienda/compras/{venta.Id}"
            });

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Pedido actualizado.", Mapeo.DeVenta(venta)));
        }
    }
}
