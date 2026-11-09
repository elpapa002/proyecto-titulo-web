using System.Globalization;
using System.Text;
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
    [Route("api/categorias")]
    public class CategoriasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriasController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetCategorias()
        {
            var categorias = await _context.Categorias.OrderBy(c => c.Id).ToListAsync();
            var arbol = categorias
                .Where(c => c.PadreId == null)
                .Select(c => new CategoriaArbolDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Ruta = c.Ruta,
                    PadreId = c.PadreId,
                    Subcategorias = categorias.Where(s => s.PadreId == c.Id).Select(Mapeo.DeCategoria).ToList()
                })
                .ToList();
            return Ok(RespuestaApi.Exito("Categorías obtenidas.", arbol));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCategoria(CategoriaCrearDto datos)
        {
            var ruta = CrearRuta(datos.Nombre);
            if (ruta == "")
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El nombre debe tener letras o números." }));

            var problema = await RevisarPadre(datos.PadreId, 0);
            if (problema != null) return problema;

            if (await _context.Categorias.AnyAsync(c => c.Ruta == ruta))
                return Conflict(RespuestaApi.Error("Ya existe una categoría con ese nombre.", new List<string> { "nombre: ya existe una categoría con ese nombre." }));

            var categoria = new Categoria { Nombre = LimpiarNombre(datos.Nombre), Ruta = ruta, PadreId = datos.PadreId };
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return Created($"/api/categorias/{categoria.Id}", RespuestaApi.Exito("Categoría creada.", Mapeo.DeCategoria(categoria)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCategoria(int id, CategoriaCrearDto datos)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria is null) return NotFound(RespuestaApi.Error("Categoría no encontrada."));

            var ruta = CrearRuta(datos.Nombre);
            if (ruta == "")
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El nombre debe tener letras o números." }));
            if (datos.PadreId == id)
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "Una categoría no puede ser su propia categoría padre." }));

            var problema = await RevisarPadre(datos.PadreId, id);
            if (problema != null) return problema;

            if (await _context.Categorias.AnyAsync(c => c.Ruta == ruta && c.Id != id))
                return Conflict(RespuestaApi.Error("Ya existe una categoría con ese nombre.", new List<string> { "nombre: ya existe una categoría con ese nombre." }));

            categoria.Nombre = LimpiarNombre(datos.Nombre);
            categoria.Ruta = ruta;
            categoria.PadreId = datos.PadreId;
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Categoría actualizada.", Mapeo.DeCategoria(categoria)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria is null) return NotFound(RespuestaApi.Error("Categoría no encontrada."));

            if (await _context.Categorias.AnyAsync(c => c.PadreId == id))
                return Conflict(RespuestaApi.Error("La categoría tiene subcategorías."));
            if (await _context.Productos.AnyAsync(p => p.CategoriaId == id || p.SubcategoriaId == id))
                return Conflict(RespuestaApi.Error("Hay publicaciones en esta categoría."));

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<IActionResult> RevisarPadre(int? padreId, int idActual)
        {
            if (padreId == null) return null;

            var padre = await _context.Categorias.FindAsync(padreId.Value);
            if (padre is null) return NotFound(RespuestaApi.Error("La categoría padre no existe."));
            if (padre.PadreId != null)
                return Conflict(RespuestaApi.Error("Solo se permiten dos niveles: la categoría padre no puede ser una subcategoría."));
            if (idActual != 0 && await _context.Categorias.AnyAsync(c => c.PadreId == idActual))
                return Conflict(RespuestaApi.Error("Esta categoría tiene subcategorías, por eso no puede quedar dentro de otra."));
            return null;
        }

        private static string LimpiarNombre(string nombre)
        {
            return Regex.Replace(nombre.Trim(), @"\s+", " ");
        }

        private static string CrearRuta(string nombre)
        {
            var separado = nombre.Trim().ToLower().Normalize(NormalizationForm.FormD);
            var sinTildes = new StringBuilder();
            foreach (var letra in separado)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(letra) != UnicodeCategory.NonSpacingMark) sinTildes.Append(letra);
            }
            var ruta = Regex.Replace(sinTildes.ToString(), "[^a-z0-9]+", "-");
            return ruta.Trim('-');
        }
    }
}
