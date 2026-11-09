using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/envios")]
    public class EnviosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EnviosController(AppDbContext context) => _context = context;

        [HttpGet("/api/vendedores/{vendedorId}/envios")]
        public async Task<IActionResult> GetCostosVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var costos = await _context.CostosEnvio
                .Where(c => c.VendedorId == vendedorId)
                .OrderBy(c => c.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Costos de envío obtenidos.", costos.Select(Mapeo.DeCostoEnvio).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/envios/{comuna}")]
        public async Task<IActionResult> CalcularEnvio(int vendedorId, string comuna)
        {
            var buscada = comuna.Trim().ToLower();
            var costo = await _context.CostosEnvio
                .FirstOrDefaultAsync(c => c.VendedorId == vendedorId && c.Comuna.ToLower() == buscada);
            if (costo is null) return NotFound(RespuestaApi.Error($"Este emprendedor no despacha a {comuna}."));
            return Ok(RespuestaApi.Exito("Costo de envío encontrado.", Mapeo.DeCostoEnvio(costo)));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCostoEnvio(CostoEnvioCrearDto datos)
        {
            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var comuna = datos.Comuna.Trim();
            if (await ComunaRepetida(datos.VendedorId, comuna, 0))
                return Conflict(RespuestaApi.Error("Ya tienes un costo para esa comuna.", new List<string> { "comuna: ya tiene un costo de envío." }));

            var costo = new CostoEnvio { VendedorId = datos.VendedorId, Comuna = comuna, Costo = datos.Costo, Dias = datos.Dias };
            _context.CostosEnvio.Add(costo);
            await _context.SaveChangesAsync();

            return Created($"/api/envios/{costo.Id}", RespuestaApi.Exito("Costo de envío creado.", Mapeo.DeCostoEnvio(costo)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCostoEnvio(int id, CostoEnvioCrearDto datos)
        {
            var costo = await _context.CostosEnvio.FindAsync(id);
            if (costo is null) return NotFound(RespuestaApi.Error("Costo de envío no encontrado."));

            var comuna = datos.Comuna.Trim();
            if (await ComunaRepetida(costo.VendedorId, comuna, id))
                return Conflict(RespuestaApi.Error("Ya tienes un costo para esa comuna.", new List<string> { "comuna: ya tiene un costo de envío." }));

            costo.Comuna = comuna;
            costo.Costo = datos.Costo;
            costo.Dias = datos.Dias;
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Costo de envío actualizado.", Mapeo.DeCostoEnvio(costo)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCostoEnvio(int id)
        {
            var costo = await _context.CostosEnvio.FindAsync(id);
            if (costo is null) return NotFound(RespuestaApi.Error("Costo de envío no encontrado."));

            _context.CostosEnvio.Remove(costo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<bool> ComunaRepetida(int vendedorId, string comuna, int idActual)
        {
            var buscada = comuna.ToLower();
            return await _context.CostosEnvio.AnyAsync(c => c.VendedorId == vendedorId && c.Comuna.ToLower() == buscada && c.Id != idActual);
        }
    }
}
