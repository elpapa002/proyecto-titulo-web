using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/preguntas")]
    public class PreguntasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PreguntasController(AppDbContext context) => _context = context;

        private IQueryable<Pregunta> ConsultaPreguntas()
        {
            return _context.Preguntas
                .Include(p => p.Cliente)
                .Include(p => p.Producto);
        }

        [HttpGet("/api/productos/{productoId}/preguntas")]
        public async Task<IActionResult> GetPreguntasProducto(int productoId)
        {
            if (await _context.Productos.FindAsync(productoId) is null)
                return NotFound(RespuestaApi.Error("No existe la publicación."));

            var preguntas = await ConsultaPreguntas()
                .Where(p => p.ProductoId == productoId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Preguntas obtenidas.", preguntas.Select(Mapeo.DePregunta).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/preguntas")]
        public async Task<IActionResult> GetPreguntasVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var preguntas = await ConsultaPreguntas()
                .Where(p => p.Producto.VendedorId == vendedorId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Preguntas recibidas obtenidas.", preguntas.Select(Mapeo.DePregunta).ToList()));
        }

        [HttpPost("/api/productos/{productoId}/preguntas")]
        public async Task<IActionResult> CrearPregunta(int productoId, PreguntaCrearDto datos)
        {
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));
            if (producto.VendedorId == datos.ClienteId)
                return Conflict(RespuestaApi.Error("No puedes hacer preguntas en tu propia publicación."));

            var pregunta = new Pregunta
            {
                ProductoId = productoId,
                Producto = producto,
                ClienteId = datos.ClienteId,
                Cliente = cliente,
                Texto = datos.Texto.Trim(),
                Fecha = Validaciones.Hoy(),
                Respuesta = "",
                FechaRespuesta = null
            };
            _context.Preguntas.Add(pregunta);

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = producto.VendedorId,
                Texto = $"Tienes una pregunta nueva en {producto.Nombre}.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = "/mi-tienda/preguntas"
            });

            await _context.SaveChangesAsync();
            return Created($"/api/preguntas/{pregunta.Id}", RespuestaApi.Exito("Pregunta enviada.", Mapeo.DePregunta(pregunta)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ResponderPregunta(int id, RespuestaPreguntaDto datos)
        {
            var pregunta = await ConsultaPreguntas().FirstOrDefaultAsync(p => p.Id == id);
            if (pregunta is null) return NotFound(RespuestaApi.Error("Pregunta no encontrada."));

            pregunta.Respuesta = datos.Respuesta.Trim();
            pregunta.FechaRespuesta = Validaciones.Hoy();

            _context.Notificaciones.Add(new Notificacion
            {
                UsuarioId = pregunta.ClienteId,
                Texto = "El vendedor respondió tu pregunta.",
                Fecha = Validaciones.Hoy(),
                Leida = false,
                Ruta = $"/tienda/producto/{pregunta.ProductoId}"
            });

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Pregunta respondida.", Mapeo.DePregunta(pregunta)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPregunta(int id)
        {
            var pregunta = await _context.Preguntas.FindAsync(id);
            if (pregunta is null) return NotFound(RespuestaApi.Error("Pregunta no encontrada."));

            _context.Preguntas.Remove(pregunta);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
