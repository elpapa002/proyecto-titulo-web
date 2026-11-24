using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    // correos adicionales de una persona (el principal esta en usuario.correo)
    [ApiController]
    [Route("api/correos")]
    public class CorreosController : ControllerBase
    {
        private const int MaximoCorreos = 5;

        private readonly AppDbContext _context;
        public CorreosController(AppDbContext context) => _context = context;

        [HttpGet("/api/usuarios/{usuarioId}/correos")]
        public async Task<IActionResult> GetCorreosUsuario(int usuarioId)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var correos = await _context.CorreosAdicionales
                .Where(c => c.UsuarioId == usuarioId)
                .OrderBy(c => c.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Correos obtenidos.", correos.Select(Mapeo.DeCorreo).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCorreo(CorreoCrearDto datos)
        {
            if (!this.Puede(datos.UsuarioId)) return this.SinPermiso();
            if (await _context.Usuarios.FindAsync(datos.UsuarioId) is null)
                return NotFound(RespuestaApi.Error("El usuario no existe."));

            var correo = datos.Correo.Trim().ToLower();
            if (await Correos.EstaOcupado(_context, correo))
                return Conflict(RespuestaApi.Error("Ese correo ya pertenece a una persona registrada.", new List<string> { "correo: ya está registrado." }));
            if (await _context.CorreosAdicionales.CountAsync(c => c.UsuarioId == datos.UsuarioId) >= MaximoCorreos)
                return Conflict(RespuestaApi.Error($"Puedes agregar como máximo {MaximoCorreos} correos adicionales."));

            var nuevo = new CorreoAdicional { UsuarioId = datos.UsuarioId, Correo = correo };
            _context.CorreosAdicionales.Add(nuevo);
            await _context.SaveChangesAsync();
            return Created($"/api/correos/{nuevo.Id}", RespuestaApi.Exito("Correo agregado.", Mapeo.DeCorreo(nuevo)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCorreo(int id, CorreoCrearDto datos)
        {
            var existente = await _context.CorreosAdicionales.FindAsync(id);
            if (existente is null) return NotFound(RespuestaApi.Error("Correo no encontrado."));
            if (!this.Puede(existente.UsuarioId)) return this.SinPermiso();

            var correo = datos.Correo.Trim().ToLower();
            if (correo != existente.Correo && await Correos.EstaOcupado(_context, correo))
                return Conflict(RespuestaApi.Error("Ese correo ya pertenece a una persona registrada.", new List<string> { "correo: ya está registrado." }));

            existente.Correo = correo;
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Correo actualizado.", Mapeo.DeCorreo(existente)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCorreo(int id)
        {
            var correo = await _context.CorreosAdicionales.FindAsync(id);
            if (correo is null) return NotFound(RespuestaApi.Error("Correo no encontrado."));
            if (!this.Puede(correo.UsuarioId)) return this.SinPermiso();

            _context.CorreosAdicionales.Remove(correo);
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Correo eliminado correctamente.", null));
        }
    }
}
