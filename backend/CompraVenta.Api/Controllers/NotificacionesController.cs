using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/notificaciones")]
    public class NotificacionesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NotificacionesController(AppDbContext context) => _context = context;

        [HttpGet("/api/usuarios/{usuarioId}/notificaciones")]
        public async Task<IActionResult> GetNotificaciones(int usuarioId)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var notificaciones = await _context.Notificaciones
                .Where(n => n.UsuarioId == usuarioId)
                .OrderByDescending(n => n.Fecha).ThenByDescending(n => n.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Notificaciones obtenidas.", notificaciones.Select(Mapeo.DeNotificacion).ToList()));
        }

        [HttpPut("/api/usuarios/{usuarioId}/notificaciones")]
        public async Task<IActionResult> MarcarTodas(int usuarioId, NotificacionEditarDto datos)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var notificaciones = await _context.Notificaciones.Where(n => n.UsuarioId == usuarioId).ToListAsync();
            foreach (var notificacion in notificaciones)
            {
                notificacion.Leida = datos.Leida;
            }
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Notificaciones actualizadas.", new { usuarioId }));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> MarcarLeida(int id, NotificacionEditarDto datos)
        {
            var notificacion = await _context.Notificaciones.FindAsync(id);
            if (notificacion is null) return NotFound(RespuestaApi.Error("Notificación no encontrada."));

            notificacion.Leida = datos.Leida;
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Notificación actualizada.", Mapeo.DeNotificacion(notificacion)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarNotificacion(int id)
        {
            var notificacion = await _context.Notificaciones.FindAsync(id);
            if (notificacion is null) return NotFound(RespuestaApi.Error("Notificación no encontrada."));

            _context.Notificaciones.Remove(notificacion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
