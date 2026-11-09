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
    [Route("api/direcciones")]
    public class DireccionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DireccionesController(AppDbContext context) => _context = context;

        [HttpGet("/api/usuarios/{usuarioId}/direcciones")]
        public async Task<IActionResult> GetDireccionesUsuario(int usuarioId)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var direcciones = await _context.Direcciones
                .Where(d => d.UsuarioId == usuarioId)
                .OrderBy(d => d.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Direcciones obtenidas.", direcciones.Select(Mapeo.DeDireccion).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearDireccion(DireccionCrearDto datos)
        {
            var problema = RevisarDireccion(datos);
            if (problema != null) return problema;

            if (await _context.Usuarios.FindAsync(datos.UsuarioId) is null)
                return NotFound(RespuestaApi.Error("El usuario no existe."));

            var propias = await _context.Direcciones.Where(d => d.UsuarioId == datos.UsuarioId).ToListAsync();
            var direccion = new Direccion
            {
                UsuarioId = datos.UsuarioId,
                Calle = datos.Calle.Trim(),
                Numero = datos.Numero.Trim().ToUpper(),
                Comuna = datos.Comuna.Trim(),
                CodigoPostal = (datos.CodigoPostal ?? "").Trim(),
                Principal = propias.Count == 0 || datos.Principal
            };

            if (direccion.Principal)
            {
                foreach (var otra in propias)
                {
                    otra.Principal = false;
                }
            }

            _context.Direcciones.Add(direccion);
            await _context.SaveChangesAsync();

            return Created($"/api/direcciones/{direccion.Id}", RespuestaApi.Exito("Dirección creada.", Mapeo.DeDireccion(direccion)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarDireccion(int id, DireccionCrearDto datos)
        {
            var direccion = await _context.Direcciones.FindAsync(id);
            if (direccion is null) return NotFound(RespuestaApi.Error("Dirección no encontrada."));

            var problema = RevisarDireccion(datos);
            if (problema != null) return problema;

            direccion.Calle = datos.Calle.Trim();
            direccion.Numero = datos.Numero.Trim().ToUpper();
            direccion.Comuna = datos.Comuna.Trim();
            direccion.CodigoPostal = (datos.CodigoPostal ?? "").Trim();

            if (datos.Principal && !direccion.Principal)
            {
                var otras = await _context.Direcciones.Where(d => d.UsuarioId == direccion.UsuarioId && d.Id != id).ToListAsync();
                foreach (var otra in otras)
                {
                    otra.Principal = false;
                }
                direccion.Principal = true;
            }

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Dirección actualizada.", Mapeo.DeDireccion(direccion)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarDireccion(int id)
        {
            var direccion = await _context.Direcciones.FindAsync(id);
            if (direccion is null) return NotFound(RespuestaApi.Error("Dirección no encontrada."));

            var otras = await _context.Direcciones
                .Where(d => d.UsuarioId == direccion.UsuarioId && d.Id != id)
                .OrderBy(d => d.Id)
                .ToListAsync();
            if (otras.Count == 0)
                return Conflict(RespuestaApi.Error("Debes tener al menos una dirección de despacho."));

            if (direccion.Principal) otras[0].Principal = true;

            _context.Direcciones.Remove(direccion);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private IActionResult RevisarDireccion(DireccionCrearDto datos)
        {
            var errores = new List<string>();
            var calle = datos.Calle.Trim();
            var numero = datos.Numero.Trim().ToUpper();
            if (calle.Length < 3 || calle.Length > 80) errores.Add("La calle debe tener entre 3 y 80 caracteres.");
            if (!Regex.IsMatch(numero, @"^\d{1,6}$") && numero != "S/N") errores.Add("El número debe tener solo dígitos, o S/N si no tiene número.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));
            return null;
        }
    }
}
