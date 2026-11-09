using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/mensajes")]
    public class MensajesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MensajesController(AppDbContext context) => _context = context;

        [HttpGet("/api/usuarios/{usuarioId}/conversaciones")]
        public async Task<IActionResult> GetConversaciones(int usuarioId, [FromQuery] bool? comoVendedor)
        {
            if (await _context.Usuarios.FindAsync(usuarioId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var mios = await _context.Mensajes
                .Where(m => m.ClienteId == usuarioId || m.VendedorId == usuarioId)
                .OrderBy(m => m.Fecha).ThenBy(m => m.Id)
                .ToListAsync();
            if (comoVendedor == true) mios = mios.Where(m => m.VendedorId == usuarioId).ToList();
            if (comoVendedor == false) mios = mios.Where(m => m.ClienteId == usuarioId).ToList();

            var idsUsuarios = mios.Select(m => m.ClienteId).Concat(mios.Select(m => m.VendedorId)).Distinct().ToList();
            var usuarios = await _context.Usuarios
                .Include(u => u.Compania)
                .Where(u => idsUsuarios.Contains(u.Id))
                .ToListAsync();

            var conversaciones = new List<ConversacionDto>();
            foreach (var grupo in mios.GroupBy(m => new { m.ClienteId, m.VendedorId }))
            {
                var ultimo = grupo.Last();
                var cliente = usuarios.FirstOrDefault(u => u.Id == grupo.Key.ClienteId);
                var vendedor = usuarios.FirstOrDefault(u => u.Id == grupo.Key.VendedorId);
                conversaciones.Add(new ConversacionDto
                {
                    ClienteId = grupo.Key.ClienteId,
                    VendedorId = grupo.Key.VendedorId,
                    Nombre = grupo.Key.VendedorId == usuarioId ? Nombres.Corto(cliente) : Nombres.Tienda(vendedor),
                    Ultimo = ultimo.Texto,
                    Fecha = Mapeo.DeMensaje(ultimo).Fecha
                });
            }

            var ordenadas = conversaciones.OrderByDescending(c => c.Fecha).ToList();
            return Ok(RespuestaApi.Exito("Conversaciones obtenidas.", ordenadas));
        }

        [HttpGet("/api/conversaciones/{clienteId}/{vendedorId}")]
        public async Task<IActionResult> GetMensajes(int clienteId, int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(clienteId) is null || await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var mensajes = await _context.Mensajes
                .Where(m => m.ClienteId == clienteId && m.VendedorId == vendedorId)
                .OrderBy(m => m.Fecha).ThenBy(m => m.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Mensajes obtenidos.", mensajes.Select(Mapeo.DeMensaje).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> EnviarMensaje(MensajeCrearDto datos)
        {
            if (datos.AutorId != datos.ClienteId && datos.AutorId != datos.VendedorId)
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El autor debe ser el cliente o el vendedor de la conversación." }));
            if (string.IsNullOrWhiteSpace(datos.Texto))
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El mensaje no puede estar vacío." }));

            var cliente = await _context.Usuarios.FindAsync(datos.ClienteId);
            if (cliente is null) return NotFound(RespuestaApi.Error("El cliente no existe."));

            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El destinatario no tiene el rol Vendedor."));
            if (datos.ClienteId == datos.VendedorId) return Conflict(RespuestaApi.Error("No puedes enviarte mensajes a ti mismo."));

            var mensaje = new Mensaje
            {
                ClienteId = datos.ClienteId,
                VendedorId = datos.VendedorId,
                AutorId = datos.AutorId,
                Texto = datos.Texto.Trim(),
                Fecha = DateTime.Now
            };
            _context.Mensajes.Add(mensaje);
            await _context.SaveChangesAsync();

            return Created($"/api/mensajes/{mensaje.Id}", RespuestaApi.Exito("Mensaje enviado.", Mapeo.DeMensaje(mensaje)));
        }
    }
}
