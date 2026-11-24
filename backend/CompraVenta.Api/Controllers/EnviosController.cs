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

        // la configuracion va antes que /envios/{comuna} para que "configuracion" no se lea como una comuna
        [HttpGet("/api/vendedores/{vendedorId}/envios/configuracion")]
        public async Task<IActionResult> GetConfiguracion(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));
            var configuracion = await Envios.Configuracion(_context, vendedorId);
            return Ok(RespuestaApi.Exito("Configuración de envío obtenida.", Mapeo.DeConfiguracionEnvio(configuracion)));
        }

        [HttpPut("/api/vendedores/{vendedorId}/envios/configuracion")]
        public async Task<IActionResult> GuardarConfiguracion(int vendedorId, ConfiguracionEnvioDto datos)
        {
            if (!this.Puede(vendedorId)) return this.SinPermiso();
            var vendedor = await _context.Usuarios.FindAsync(vendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("Vendedor no encontrado."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var errores = new List<string>();
            var direccion = (datos.DireccionRetiro ?? "").Trim();
            if (datos.RetiroLocal && direccion.Length < 5) errores.Add("Para permitir el retiro en el local indica la dirección de retiro.");
            if (datos.Forma == "Peso" && datos.CostoBase == 0 && datos.CostoKilo == 0)
                errores.Add("Para cobrar según el peso indica el costo base o el costo por kilo adicional.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var configuracion = await _context.ConfiguracionesEnvio.FindAsync(vendedorId);
            if (configuracion is null)
            {
                configuracion = new ConfiguracionEnvio { VendedorId = vendedorId };
                _context.ConfiguracionesEnvio.Add(configuracion);
            }
            configuracion.Forma = datos.Forma;
            configuracion.CostoBase = datos.CostoBase;
            configuracion.CostoKilo = datos.CostoKilo;
            configuracion.TamanoMaximo = (datos.TamanoMaximo ?? "").Trim();
            configuracion.RetiroLocal = datos.RetiroLocal;
            configuracion.DireccionRetiro = datos.RetiroLocal ? direccion : "";
            await _context.SaveChangesAsync();

            return Ok(RespuestaApi.Exito("Configuración de envío guardada.", Mapeo.DeConfiguracionEnvio(configuracion)));
        }

        // ?peso=2.5 (kilos del pedido) se usa cuando el emprendedor cobra segun el peso
        [HttpGet("/api/vendedores/{vendedorId}/envios/{comuna}")]
        public async Task<IActionResult> CalcularEnvio(int vendedorId, string comuna, [FromQuery] decimal? peso)
        {
            if (peso != null && (peso < 0 || peso > 1000))
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El peso debe estar entre 0 y 1000 kg." }));
            var calculo = await Envios.Calcular(_context, vendedorId, comuna, peso ?? 0);
            if (calculo is null) return NotFound(RespuestaApi.Error($"Este emprendedor no despacha a {comuna}."));
            return Ok(RespuestaApi.Exito("Costo de envío calculado.", calculo));
        }

        [HttpPost]
        public async Task<IActionResult> CrearCostoEnvio(CostoEnvioCrearDto datos)
        {
            if (!this.Puede(datos.VendedorId)) return this.SinPermiso("Solo puedes crear costos de envío a tu nombre.");
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
            if (!this.Puede(costo.VendedorId)) return this.SinPermiso("Solo puedes cambiar tus propios costos de envío.");

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
            if (!this.Puede(costo.VendedorId)) return this.SinPermiso("Solo puedes eliminar tus propios costos de envío.");

            _context.CostosEnvio.Remove(costo);
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Costo de envío eliminado correctamente.", null));
        }

        private async Task<bool> ComunaRepetida(int vendedorId, string comuna, int idActual)
        {
            var buscada = comuna.ToLower();
            return await _context.CostosEnvio.AnyAsync(c => c.VendedorId == vendedorId && c.Comuna.ToLower() == buscada && c.Id != idActual);
        }
    }
}
