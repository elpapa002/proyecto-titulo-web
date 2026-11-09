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
    [Route("api/telefonos")]
    public class TelefonosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TelefonosController(AppDbContext context) => _context = context;

        [HttpGet("/api/usuarios/{usuarioId}/telefonos")]
        public async Task<IActionResult> GetTelefonosUsuario(int usuarioId)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var telefonos = await _context.Telefonos
                .Where(t => t.UsuarioId == usuarioId)
                .OrderBy(t => t.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Teléfonos obtenidos.", telefonos.Select(Mapeo.DeTelefono).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearTelefono(TelefonoCrearDto datos)
        {
            var problema = RevisarNumero(datos.Numero);
            if (problema != null) return problema;

            if (await _context.Usuarios.FindAsync(datos.UsuarioId) is null)
                return NotFound(RespuestaApi.Error("El usuario no existe."));

            if (await TelefonoRepetido(datos.Numero, 0))
                return Conflict(RespuestaApi.Error("Ese teléfono ya pertenece a otra persona.", new List<string> { "numero: ya está registrado." }));

            var telefono = new Telefono { UsuarioId = datos.UsuarioId, Numero = datos.Numero.Trim() };
            _context.Telefonos.Add(telefono);
            await _context.SaveChangesAsync();

            return Created($"/api/telefonos/{telefono.Id}", RespuestaApi.Exito("Teléfono creado.", Mapeo.DeTelefono(telefono)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarTelefono(int id, TelefonoCrearDto datos)
        {
            var telefono = await _context.Telefonos.FindAsync(id);
            if (telefono is null) return NotFound(RespuestaApi.Error("Teléfono no encontrado."));

            var problema = RevisarNumero(datos.Numero);
            if (problema != null) return problema;

            if (await TelefonoRepetido(datos.Numero, id))
                return Conflict(RespuestaApi.Error("Ese teléfono ya pertenece a otra persona.", new List<string> { "numero: ya está registrado." }));

            telefono.Numero = datos.Numero.Trim();
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Teléfono actualizado.", Mapeo.DeTelefono(telefono)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarTelefono(int id)
        {
            var telefono = await _context.Telefonos.FindAsync(id);
            if (telefono is null) return NotFound(RespuestaApi.Error("Teléfono no encontrado."));

            _context.Telefonos.Remove(telefono);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private IActionResult RevisarNumero(string numero)
        {
            var sinEspacios = (numero ?? "").Replace(" ", "");
            if (!Regex.IsMatch(sinEspacios, @"^\+569\d{8}$"))
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El teléfono debe ser +56 9 seguido de 8 dígitos." }));
            return null;
        }

        private async Task<bool> TelefonoRepetido(string numero, int idActual)
        {
            var digitos = Validaciones.SoloDigitos(numero);
            var otros = await _context.Telefonos.Where(t => t.Id != idActual).ToListAsync();
            return otros.Any(t => Validaciones.SoloDigitos(t.Numero) == digitos);
        }
    }
}
