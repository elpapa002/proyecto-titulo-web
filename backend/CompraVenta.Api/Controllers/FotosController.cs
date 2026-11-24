using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    // fotos de las publicaciones, guardadas en la base (tabla foto)
    [ApiController]
    [Route("api/fotos")]
    public class FotosController : ControllerBase
    {
        private const int MaximoFotos = 4;
        private const int MaximoBytes = 2 * 1024 * 1024;

        private readonly AppDbContext _context;
        public FotosController(AppDbContext context) => _context = context;

        // publica (sin token) para que funcione en <img src="...">
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoto(int id)
        {
            var foto = await _context.Fotos.FindAsync(id);
            if (foto is null) return NotFound(RespuestaApi.Error("No existe la foto."));
            Response.Headers.CacheControl = "public, max-age=86400";
            return File(foto.Datos, foto.Tipo);
        }

        [HttpPost("/api/productos/{productoId}/fotos")]
        public async Task<IActionResult> SubirFoto(int productoId, FotoCrearDto datos)
        {
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));
            if (!this.Puede(producto.VendedorId)) return this.SinPermiso("Solo puedes subir fotos a tus propias publicaciones.");

            byte[] bytes;
            try
            {
                var texto = datos.Datos.Contains(",") ? datos.Datos.Substring(datos.Datos.IndexOf(',') + 1) : datos.Datos;
                bytes = Convert.FromBase64String(texto.Trim());
            }
            catch (FormatException)
            {
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "La foto debe venir en base64." }));
            }

            var errores = new List<string>();
            var tipo = TipoReal(bytes);
            if (tipo == null) errores.Add("La foto debe ser JPG, PNG o WEBP.");
            else if (tipo != datos.Tipo) errores.Add($"El archivo es {tipo} y no {datos.Tipo}.");
            if (bytes.Length > MaximoBytes) errores.Add("Cada foto puede pesar como máximo 2 MB.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var cantidad = await _context.Fotos.CountAsync(f => f.ProductoId == productoId);
            if (cantidad >= MaximoFotos) return Conflict(RespuestaApi.Error($"Cada publicación puede tener como máximo {MaximoFotos} fotos."));

            var orden = cantidad == 0 ? 0 : await _context.Fotos.Where(f => f.ProductoId == productoId).MaxAsync(f => f.Orden) + 1;
            var foto = new Foto { ProductoId = productoId, Orden = orden, Tipo = tipo, Datos = bytes };
            _context.Fotos.Add(foto);
            await _context.SaveChangesAsync();
            return Created($"/api/fotos/{foto.Id}", RespuestaApi.Exito("Foto subida.", new FotoDto { Id = foto.Id, Orden = foto.Orden }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarFoto(int id)
        {
            var foto = await _context.Fotos.FindAsync(id);
            if (foto is null) return NotFound(RespuestaApi.Error("No existe la foto."));
            var producto = await _context.Productos.FindAsync(foto.ProductoId);
            if (!this.Puede(producto.VendedorId)) return this.SinPermiso("Solo puedes quitar fotos de tus propias publicaciones.");

            _context.Fotos.Remove(foto);
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Foto eliminada correctamente.", null));
        }

        // se revisan los primeros bytes del archivo, no solo lo que dice el navegador
        private static string TipoReal(byte[] b)
        {
            if (b.Length > 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return "image/jpeg";
            if (b.Length > 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) return "image/png";
            if (b.Length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "image/webp";
            return null;
        }
    }
}
