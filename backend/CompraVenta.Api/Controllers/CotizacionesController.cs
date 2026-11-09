using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/cotizaciones")]
    public class CotizacionesController : ControllerBase
    {
        private const int DiasVigencia = 15;

        private readonly AppDbContext _context;
        public CotizacionesController(AppDbContext context) => _context = context;

        private IQueryable<Cotizacion> ConsultaCotizaciones()
        {
            return _context.Cotizaciones
                .Include(c => c.Detalles)
                .Include(c => c.Cliente)
                .Include(c => c.Vendedor).ThenInclude(u => u.Compania);
        }

        [HttpGet("/api/clientes/{clienteId}/cotizaciones")]
        public async Task<IActionResult> GetCotizacionesCliente(int clienteId)
        {
            if (await _context.Usuarios.FindAsync(clienteId) is null)
                return NotFound(RespuestaApi.Error("Cliente no encontrado."));

            var cotizaciones = await ConsultaCotizaciones()
                .Where(c => c.ClienteId == clienteId)
                .OrderByDescending(c => c.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Cotizaciones obtenidas.", cotizaciones.Select(Mapeo.DeCotizacion).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/cotizaciones")]
        public async Task<IActionResult> GetCotizacionesVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var cotizaciones = await ConsultaCotizaciones()
                .Where(c => c.VendedorId == vendedorId)
                .OrderByDescending(c => c.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Cotizaciones recibidas obtenidas.", cotizaciones.Select(Mapeo.DeCotizacion).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCotizacion(CotizacionCrearDto datos)
        {
            var errores = new List<string>();
            if (datos.Items.Any(i => i.ProductoId == null)) errores.Add("Cada producto debe indicar su productoId.");
            DateOnly? fechaRequerida = null;
            if (!string.IsNullOrEmpty(datos.FechaRequerida))
            {
                if (!Validaciones.LeerFecha(datos.FechaRequerida, out var fecha)) errores.Add("La fecha requerida debe tener el formato AAAA-MM-DD.");
                else if (fecha < Validaciones.Hoy()) errores.Add("La fecha requerida no puede ser pasada.");
                else fechaRequerida = fecha;
            }
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));

            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));
            if (datos.ClienteId == datos.VendedorId) return Conflict(RespuestaApi.Error("No puedes pedirte una cotización a ti mismo."));

            var ids = datos.Items.Select(i => i.ProductoId.Value).ToList();
            var productos = await _context.Productos.Where(p => ids.Contains(p.Id)).ToListAsync();
            foreach (var item in datos.Items)
            {
                var producto = productos.FirstOrDefault(p => p.Id == item.ProductoId);
                if (producto is null) return NotFound(RespuestaApi.Error($"El producto {item.ProductoId} no existe."));
                if (producto.VendedorId != datos.VendedorId) return Conflict(RespuestaApi.Error($"{producto.Nombre} no pertenece a este vendedor."));
            }

            using var transaccion = await _context.Database.BeginTransactionAsync();

            var cotizacion = new Cotizacion
            {
                ClienteId = datos.ClienteId,
                VendedorId = datos.VendedorId,
                Fecha = Validaciones.Hoy(),
                Mensaje = datos.Mensaje.Trim(),
                FechaRequerida = fechaRequerida,
                Estado = "Pendiente",
                RespuestaTotal = null,
                RespuestaComentario = "",
                RespuestaFecha = null,
                Vigencia = null
            };
            _context.Cotizaciones.Add(cotizacion);
            await _context.SaveChangesAsync();

            foreach (var item in datos.Items)
            {
                var producto = productos.First(p => p.Id == item.ProductoId);
                _context.DetallesCotizacion.Add(new DetalleCotizacion
                {
                    CotizacionId = cotizacion.Id,
                    ProductoId = producto.Id,
                    Nombre = producto.Nombre,
                    Cantidad = item.Cantidad,
                    Precio = null
                });
            }

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = datos.VendedorId,
                Texto = $"{Nombres.Corto(cliente)} te pidió una cotización.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = "/mi-tienda/cotizaciones"
            });

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            var creada = await ConsultaCotizaciones().FirstAsync(c => c.Id == cotizacion.Id);
            return Created($"/api/cotizaciones/{cotizacion.Id}", RespuestaApi.Exito("Cotización enviada.", Mapeo.DeCotizacion(creada)));
        }

        [HttpPut("{id}/respuesta")]
        public async Task<IActionResult> ResponderCotizacion(int id, ResponderCotizacionDto datos)
        {
            var cotizacion = await ConsultaCotizaciones().FirstOrDefaultAsync(c => c.Id == id);
            if (cotizacion is null) return NotFound(RespuestaApi.Error("Cotización no encontrada."));

            var errores = new List<string>();
            foreach (var precio in datos.Precios)
            {
                if (!cotizacion.Detalles.Any(d => d.ProductoId == precio.ProductoId))
                    errores.Add($"El producto {precio.ProductoId} no está en la cotización.");
            }
            foreach (var detalle in cotizacion.Detalles)
            {
                if (!datos.Precios.Any(p => p.ProductoId == detalle.ProductoId))
                    errores.Add($"Falta el precio de {detalle.Nombre}.");
            }
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            if (cotizacion.Estado == "Aceptada" || cotizacion.Estado == "Rechazada")
                return Conflict(RespuestaApi.Error("La cotización ya fue aceptada o rechazada y no se puede responder."));

            foreach (var detalle in cotizacion.Detalles)
            {
                detalle.Precio = datos.Precios.First(p => p.ProductoId == detalle.ProductoId).Precio;
            }
            cotizacion.Estado = "Respondida";
            cotizacion.RespuestaTotal = datos.Total;
            cotizacion.RespuestaComentario = (datos.Comentario ?? "").Trim();
            cotizacion.RespuestaFecha = Validaciones.Hoy();
            cotizacion.Vigencia = Validaciones.Hoy().AddDays(DiasVigencia);

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = cotizacion.ClienteId,
                Texto = $"{Nombres.Tienda(cotizacion.Vendedor)} respondió tu cotización.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = "/tienda/cotizaciones"
            });

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Cotización respondida.", Mapeo.DeCotizacion(cotizacion)));
        }

        [HttpPut("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, EstadoDto datos)
        {
            var cotizacion = await ConsultaCotizaciones().FirstOrDefaultAsync(c => c.Id == id);
            if (cotizacion is null) return NotFound(RespuestaApi.Error("Cotización no encontrada."));

            if (datos.Estado != "Aceptada" && datos.Estado != "Rechazada")
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El estado debe ser Aceptada o Rechazada." }));

            if (cotizacion.Estado != "Respondida")
                return Conflict(RespuestaApi.Error("Solo puedes aceptar o rechazar una cotización que ya fue respondida."));
            if (datos.Estado == "Aceptada" && Mapeo.EstadoCotizacion(cotizacion) == "Vencida")
                return Conflict(RespuestaApi.Error("La cotización está vencida y ya no se puede aceptar."));

            cotizacion.Estado = datos.Estado;

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = cotizacion.VendedorId,
                Texto = $"{Nombres.Corto(cotizacion.Cliente)} marcó su cotización como '{datos.Estado}'.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = "/mi-tienda/cotizaciones"
            });

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Estado de la cotización actualizado.", Mapeo.DeCotizacion(cotizacion)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCotizacion(int id)
        {
            var cotizacion = await _context.Cotizaciones.FindAsync(id);
            if (cotizacion is null) return NotFound(RespuestaApi.Error("Cotización no encontrada."));

            var detalles = await _context.DetallesCotizacion.Where(d => d.CotizacionId == id).ToListAsync();
            _context.DetallesCotizacion.RemoveRange(detalles);
            _context.Cotizaciones.Remove(cotizacion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
