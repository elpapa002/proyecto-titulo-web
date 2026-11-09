using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/ofertas")]
    public class OfertasController : ControllerBase
    {
        private const int DiasMaximos = 90;

        private readonly AppDbContext _context;
        public OfertasController(AppDbContext context) => _context = context;

        [HttpGet("/api/vendedores/{vendedorId}/ofertas")]
        public async Task<IActionResult> GetOfertasVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var ofertas = await _context.Ofertas
                .Include(o => o.Producto)
                .Where(o => o.VendedorId == vendedorId)
                .OrderBy(o => o.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Ofertas obtenidas.", ofertas.Select(Mapeo.DeOferta).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearOferta(OfertaCrearDto datos)
        {
            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var problema = await ValidarOferta(datos, 0, datos.VendedorId, true);
            if (problema != null) return problema;

            Validaciones.LeerFecha(datos.Inicio, out var inicio);
            Validaciones.LeerFecha(datos.Fin, out var fin);
            if (fin < Validaciones.Hoy())
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "La oferta no puede terminar en una fecha pasada." }));

            var producto = await _context.Productos.FindAsync(datos.ProductoId);
            var oferta = new Oferta
            {
                VendedorId = datos.VendedorId,
                ProductoId = datos.ProductoId,
                Producto = producto,
                PrecioOferta = datos.PrecioOferta,
                Inicio = inicio,
                Fin = fin,
                Difundir = datos.Difundir ?? false
            };
            _context.Ofertas.Add(oferta);

            if (oferta.Difundir)
            {
                var clientes = await _context.Usuarios.Where(u => u.EsCliente && u.Id != datos.VendedorId).ToListAsync();
                foreach (var cliente in clientes)
                {
                    _context.Notificaciones.Add(new Notificacion
                    {
                        UsuarioId = cliente.Id,
                        Texto = $"Nueva oferta: {producto.Nombre} a {Validaciones.Precio(oferta.PrecioOferta)}.",
                        Fecha = Validaciones.Hoy(),
                        Leida = false,
                        Ruta = $"/tienda/producto/{producto.Id}"
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Created($"/api/ofertas/{oferta.Id}", RespuestaApi.Exito("Oferta creada.", Mapeo.DeOferta(oferta)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarOferta(int id, OfertaCrearDto datos)
        {
            var oferta = await _context.Ofertas.FindAsync(id);
            if (oferta is null) return NotFound(RespuestaApi.Error("Oferta no encontrada."));

            Validaciones.LeerFecha(datos.Inicio, out var inicio);
            Validaciones.LeerFecha(datos.Fin, out var fin);
            var cambiaronFechas = inicio != oferta.Inicio || fin != oferta.Fin;

            var problema = await ValidarOferta(datos, id, oferta.VendedorId, cambiaronFechas);
            if (problema != null) return problema;

            oferta.ProductoId = datos.ProductoId;
            oferta.Producto = await _context.Productos.FindAsync(datos.ProductoId);
            oferta.PrecioOferta = datos.PrecioOferta;
            oferta.Inicio = inicio;
            oferta.Fin = fin;
            if (datos.Difundir != null) oferta.Difundir = datos.Difundir.Value;
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Oferta actualizada.", Mapeo.DeOferta(oferta)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarOferta(int id)
        {
            var oferta = await _context.Ofertas.FindAsync(id);
            if (oferta is null) return NotFound(RespuestaApi.Error("Oferta no encontrada."));

            _context.Ofertas.Remove(oferta);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<IActionResult> ValidarOferta(OfertaCrearDto datos, int idActual, int vendedorId, bool revisarDuracion)
        {
            var errores = new List<string>();
            var inicioValido = Validaciones.LeerFecha(datos.Inicio, out var inicio);
            var finValido = Validaciones.LeerFecha(datos.Fin, out var fin);
            if (!inicioValido) errores.Add("La fecha de inicio debe tener el formato AAAA-MM-DD.");
            if (!finValido) errores.Add("La fecha de término debe tener el formato AAAA-MM-DD.");
            if (inicioValido && finValido && fin < inicio) errores.Add("La fecha de término no puede ser anterior a la de inicio.");
            else if (inicioValido && finValido && revisarDuracion && fin.DayNumber - inicio.DayNumber + 1 > DiasMaximos)
                errores.Add($"La oferta puede durar como máximo {DiasMaximos} días.");

            var producto = await _context.Productos.FindAsync(datos.ProductoId);
            if (producto != null && datos.PrecioOferta >= producto.Precio)
                errores.Add("El precio de oferta debe ser menor al precio normal.");
            else if (producto != null && Math.Round((1 - (double)datos.PrecioOferta / producto.Precio) * 100, MidpointRounding.AwayFromZero) < 1)
                errores.Add("El descuento debe ser de al menos 1%.");

            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));
            if (producto is null) return NotFound(RespuestaApi.Error("El producto no existe."));
            if (producto.VendedorId != vendedorId) return Conflict(RespuestaApi.Error("El producto no pertenece a este vendedor."));

            var cruzada = await _context.Ofertas.AnyAsync(o =>
                o.Id != idActual && o.ProductoId == datos.ProductoId && o.Inicio <= fin && o.Fin >= inicio);
            if (cruzada) return Conflict(RespuestaApi.Error("Ese producto ya tiene una oferta en esas fechas."));

            return null;
        }
    }
}
