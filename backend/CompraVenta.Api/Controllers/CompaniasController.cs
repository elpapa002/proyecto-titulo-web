using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/companias")]
    public class CompaniasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CompaniasController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetCompanias()
        {
            var companias = await _context.Companias.OrderBy(c => c.Id).ToListAsync();
            return Ok(RespuestaApi.Exito("Compañías obtenidas.", companias.Select(Mapeo.DeCompania).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompania(int id)
        {
            var compania = await _context.Companias.FindAsync(id);
            if (compania is null) return NotFound(RespuestaApi.Error("Compañía no encontrada."));
            return Ok(RespuestaApi.Exito("Compañía encontrada.", Mapeo.DeCompania(compania)));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCompania(CompaniaCrearDto datos)
        {
            var errores = ValidarCompania(datos);
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var rut = Rut.Formatear(datos.Rut);
            if (await _context.Companias.AnyAsync(c => c.Rut == rut))
                return Conflict(RespuestaApi.Error("Ya existe una compañía con este RUT.", new List<string> { "rut: ya existe una compañía con ese RUT." }));

            var compania = new Compania { Rut = rut };
            CopiarDatos(compania, datos);
            _context.Companias.Add(compania);
            await _context.SaveChangesAsync();

            return Created($"/api/companias/{compania.Id}", RespuestaApi.Exito("Compañía creada.", Mapeo.DeCompania(compania)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCompania(int id, CompaniaCrearDto datos)
        {
            var compania = await _context.Companias.FindAsync(id);
            if (compania is null) return NotFound(RespuestaApi.Error("Compañía no encontrada."));

            var errores = ValidarCompania(datos);
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var rut = Rut.Formatear(datos.Rut);
            if (await _context.Companias.AnyAsync(c => c.Rut == rut && c.Id != id))
                return Conflict(RespuestaApi.Error("Ya existe una compañía con este RUT.", new List<string> { "rut: ya existe una compañía con ese RUT." }));

            compania.Rut = rut;
            CopiarDatos(compania, datos);
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Compañía actualizada.", Mapeo.DeCompania(compania)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCompania(int id)
        {
            var compania = await _context.Companias.FindAsync(id);
            if (compania is null) return NotFound(RespuestaApi.Error("Compañía no encontrada."));

            var usuarios = await _context.Usuarios.Where(u => u.CompaniaId == id).ToListAsync();
            foreach (var usuario in usuarios)
            {
                usuario.CompaniaId = null;
            }

            _context.Companias.Remove(compania);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static List<string> ValidarCompania(CompaniaCrearDto datos)
        {
            var errores = new List<string>();
            if (!Rut.EsValido(datos.Rut)) errores.Add("El RUT no es válido. Revisa el dígito verificador.");
            if (Validaciones.SoloDigitos(datos.Telefono).Length < 8) errores.Add("El teléfono debe tener al menos 8 dígitos.");
            return errores;
        }

        private static void CopiarDatos(Compania compania, CompaniaCrearDto datos)
        {
            compania.Nombre = datos.Nombre.Trim();
            compania.Personas = datos.Personas;
            compania.Telefono = datos.Telefono.Trim();
            compania.Correo = datos.Correo.Trim().ToLower();
            compania.SitioWeb = (datos.SitioWeb ?? "").Trim();
            compania.Direccion = (datos.Direccion ?? "").Trim();
        }
    }
}
