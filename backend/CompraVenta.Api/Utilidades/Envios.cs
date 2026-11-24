using System.Globalization;
using System.Text.RegularExpressions;
using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Utilidades
{
    // calculo del costo de despacho, lo usan la pantalla de compra y el registro de la venta
    public static class Envios
    {
        // fila de la tabla que se usa para las comunas que el emprendedor no puso una por una
        public const string RestoRegion = "Resto de la región";

        // "450 g", "1,2 kg", "2 kilos" -> kilos. Si no se entiende, cuenta 0
        public static decimal EnKilos(string peso)
        {
            if (string.IsNullOrWhiteSpace(peso)) return 0;
            var texto = peso.Trim().ToLowerInvariant();
            var numero = Regex.Match(texto, @"\d+([.,]\d+)?");
            if (!numero.Success) return 0;
            var valor = decimal.Parse(numero.Value.Replace(',', '.'), CultureInfo.InvariantCulture);
            var enGramos = Regex.IsMatch(texto, @"\d\s*(g|gr|grs|gramos?)\b");
            return enGramos ? valor / 1000 : valor;
        }

        // costo base + costo por cada kilo sobre el primero (2,5 kg -> base + 2 x kilo)
        public static int CostoPorPeso(ConfiguracionEnvio configuracion, decimal kilos)
        {
            var adicionales = Math.Max(0, (int)Math.Ceiling(kilos) - 1);
            return configuracion.CostoBase + adicionales * configuracion.CostoKilo;
        }

        public static async Task<ConfiguracionEnvio> Configuracion(AppDbContext context, int vendedorId)
        {
            return await context.ConfiguracionesEnvio.FindAsync(vendedorId) ?? new ConfiguracionEnvio { VendedorId = vendedorId };
        }

        // null si el emprendedor no despacha a esa comuna
        public static async Task<CalculoEnvioDto> Calcular(AppDbContext context, int vendedorId, string comuna, decimal kilos)
        {
            var buscada = (comuna ?? "").Trim().ToLower();
            var costos = await context.CostosEnvio.Where(c => c.VendedorId == vendedorId).ToListAsync();
            var fila = costos.FirstOrDefault(c => c.Comuna.ToLower() == buscada)
                ?? costos.FirstOrDefault(c => c.Comuna == RestoRegion);
            if (fila is null) return null;

            var configuracion = await Configuracion(context, vendedorId);
            var calculo = new CalculoEnvioDto
            {
                Comuna = comuna.Trim(),
                Zona = fila.Comuna,
                Forma = configuracion.Forma,
                Peso = Math.Round(kilos, 2),
                Dias = fila.Dias
            };
            if (configuracion.Forma == "Peso")
            {
                calculo.Costo = CostoPorPeso(configuracion, kilos);
                var adicionales = Math.Max(0, (int)Math.Ceiling(kilos) - 1);
                calculo.Detalle = $"{kilos.ToString("0.##", new CultureInfo("es-CL"))} kg: {Validaciones.Precio(configuracion.CostoBase)} + {adicionales} × {Validaciones.Precio(configuracion.CostoKilo)}";
            }
            else
            {
                calculo.Costo = fila.Costo;
                calculo.Detalle = fila.Comuna == RestoRegion ? "Tarifa para el resto de la región" : $"Tarifa para {fila.Comuna}";
            }
            return calculo;
        }
    }
}
