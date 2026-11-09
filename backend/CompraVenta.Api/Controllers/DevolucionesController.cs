using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/devoluciones")]
    public class DevolucionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DevolucionesController(AppDbContext context) => _context = context;

        private IQueryable<Devolucion> ConsultaDevoluciones()
        {
            return _context.Devoluciones
                .Include(d => d.Cliente)
                .Include(d => d.Vendedor).ThenInclude(u => u.Compania);
        }

        [HttpGet("/api/clientes/{clienteId}/devoluciones")]
        public async Task<IActionResult> GetDevolucionesCliente(int clienteId)
        {
            if (await _context.Usuarios.FindAsync(clienteId) is null)
                return NotFound(RespuestaApi.Error("Cliente no encontrado."));

            var devoluciones = await ConsultaDevoluciones()
                .Where(d => d.ClienteId == clienteId)
                .OrderByDescending(d => d.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Devoluciones obtenidas.", devoluciones.Select(Mapeo.DeDevolucion).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/devoluciones")]
        public async Task<IActionResult> GetDevolucionesVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var devoluciones = await ConsultaDevoluciones()
                .Where(d => d.VendedorId == vendedorId)
                .OrderByDescending(d => d.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Devoluciones recibidas obtenidas.", devoluciones.Select(Mapeo.DeDevolucion).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearDevolucion(DevolucionCrearDto datos)
        {
            var venta = await _context.Ventas.Include(v => v.Detalles).FirstOrDefaultAsync(v => v.Id == datos.VentaId);
            if (venta is null) return NotFound(RespuestaApi.Error("La compra no existe."));

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));

            var detalle = venta.Detalles.FirstOrDefault(d => d.ProductoId == datos.ProductoId);
            if (detalle != null && datos.Cantidad > detalle.Cantidad)
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "No puedes devolver más unidades de las que compraste." }));

            if (venta.ClienteId != datos.ClienteId) return Conflict(RespuestaApi.Error("Esta compra no pertenece al cliente."));
            if (venta.EstadoPedido != "Entregado") return Conflict(RespuestaApi.Error("Solo puedes pedir la devolución de compras entregadas."));
            if (detalle is null) return Conflict(RespuestaApi.Error("Ese producto no está en la compra."));

            var repetida = await _context.Devoluciones.AnyAsync(d =>
                d.VentaId == datos.VentaId && d.ProductoId == datos.ProductoId && d.Estado != "Rechazada");
            if (repetida) return Conflict(RespuestaApi.Error("Ya pediste la devolución de este producto."));

            var devolucion = new Devolucion
            {
                VentaId = venta.Id,
                ClienteId = cliente.Id,
                VendedorId = venta.VendedorId,
                ProductoId = datos.ProductoId,
                NombreProducto = detalle.Nombre,
                Cantidad = datos.Cantidad,
                Motivo = datos.Motivo.Trim(),
                Detalle = (datos.Detalle ?? "").Trim(),
                Fecha = Validaciones.Hoy(),
                Estado = "Pendiente",
                Respuesta = "",
                Monto = detalle.Precio * datos.Cantidad
            };
            _context.Devoluciones.Add(devolucion);

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = venta.VendedorId,
                Texto = $"{Nombres.Corto(cliente)} pidió la devolución de una compra.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = "/mi-tienda/devoluciones"
            });

            await _context.SaveChangesAsync();

            var creada = await ConsultaDevoluciones().FirstAsync(d => d.Id == devolucion.Id);
            return Created($"/api/devoluciones/{devolucion.Id}", RespuestaApi.Exito("Devolución solicitada.", Mapeo.DeDevolucion(creada)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ResolverDevolucion(int id, ResolverDevolucionDto datos)
        {
            var devolucion = await ConsultaDevoluciones().FirstOrDefaultAsync(d => d.Id == id);
            if (devolucion is null) return NotFound(RespuestaApi.Error("Devolución no encontrada."));

            if (devolucion.Estado != "Pendiente")
                return Conflict(RespuestaApi.Error("Esta devolución ya fue resuelta."));

            if (datos.Estado == "Aprobada" && datos.ReponerStock)
            {
                var producto = await _context.Productos.FindAsync(devolucion.ProductoId);
                if (producto != null) producto.Stock += devolucion.Cantidad;
            }

            devolucion.Estado = datos.Estado;
            devolucion.Respuesta = (datos.Respuesta ?? "").Trim();

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = devolucion.ClienteId,
                Texto = $"Tu devolución de {devolucion.NombreProducto} fue {datos.Estado.ToLower()}.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = $"/tienda/compras/{devolucion.VentaId}"
            });

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Devolución resuelta.", Mapeo.DeDevolucion(devolucion)));
        }
    }
}
