using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/calificaciones")]
    public class CalificacionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CalificacionesController(AppDbContext context) => _context = context;

        [HttpGet("/api/productos/{productoId}/calificaciones")]
        public async Task<IActionResult> GetCalificacionesProducto(int productoId)
        {
            if (await _context.Productos.FindAsync(productoId) is null)
                return NotFound(RespuestaApi.Error("No existe la publicación."));

            var calificaciones = await _context.Calificaciones
                .Include(c => c.Cliente)
                .Where(c => c.ProductoId == productoId)
                .OrderByDescending(c => c.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Calificaciones obtenidas.", calificaciones.Select(Mapeo.DeCalificacion).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCalificacion(CalificacionCrearDto datos)
        {
            var venta = await _context.Ventas.Include(v => v.Detalles).FirstOrDefaultAsync(v => v.Id == datos.VentaId);
            if (venta is null) return NotFound(RespuestaApi.Error("La compra no existe."));

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));

            if (venta.ClienteId != datos.ClienteId) return Conflict(RespuestaApi.Error("Esta compra no pertenece al cliente."));
            if (venta.EstadoPedido != "Entregado") return Conflict(RespuestaApi.Error("Solo puedes calificar compras entregadas."));
            if (venta.Calificada) return Conflict(RespuestaApi.Error("Esta compra ya fue calificada."));
            if (!venta.Detalles.Any(d => d.ProductoId == datos.ProductoId))
                return Conflict(RespuestaApi.Error("Ese producto no está en la compra."));

            var producto = await _context.Productos.FindAsync(datos.ProductoId);
            if (producto is null) return NotFound(RespuestaApi.Error("El producto no existe."));

            var calificacion = new Calificacion
            {
                VentaId = venta.Id,
                ProductoId = producto.Id,
                VendedorId = venta.VendedorId,
                ClienteId = cliente.Id,
                Cliente = cliente,
                NotaProducto = datos.NotaProducto,
                NotaVendedor = datos.NotaVendedor,
                Comentario = (datos.Comentario ?? "").Trim(),
                Fecha = Validaciones.Hoy()
            };
            _context.Calificaciones.Add(calificacion);

            var resenas = producto.Resenas + 1;
            producto.Calificacion = Math.Round((producto.Calificacion * producto.Resenas + datos.NotaProducto) / resenas, 1, MidpointRounding.AwayFromZero);
            producto.Resenas = resenas;
            venta.Calificada = true;

            await _context.SaveChangesAsync();
            return Created($"/api/calificaciones/{calificacion.Id}", RespuestaApi.Exito("Calificación guardada.", Mapeo.DeCalificacion(calificacion)));
        }
    }
}
