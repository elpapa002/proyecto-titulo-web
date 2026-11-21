using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private const int MesesMaximos = 24;
        private static readonly string[] NombresMes = { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

        private readonly AppDbContext _context;
        public ReportesController(AppDbContext context) => _context = context;

        // GET /api/vendedores/2/reportes?desde=2026-06-01&hasta=2026-11-16
        [HttpGet("/api/vendedores/{vendedorId}/reportes")]
        public async Task<IActionResult> GetReporteVendedor(int vendedorId, [FromQuery] string desde, [FromQuery] string hasta)
        {
            var errores = LeerPeriodo(desde, hasta, out var inicio, out var fin);
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Período inválido.", errores));

            var vendedor = await _context.Usuarios.Include(u => u.Compania).FirstOrDefaultAsync(u => u.Id == vendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("Vendedor no encontrado."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var ventas = await _context.Ventas
                .Include(v => v.Detalles)
                .Where(v => v.VendedorId == vendedorId && v.Fecha >= inicio && v.Fecha <= fin)
                .ToListAsync();
            var validas = ventas.Where(v => v.EstadoTransaccion != "Cancelada").ToList();

            var notas = await _context.Calificaciones
                .Where(c => c.VendedorId == vendedorId && c.Fecha >= inicio && c.Fecha <= fin)
                .Select(c => c.NotaProducto)
                .ToListAsync();

            var productos = validas
                .SelectMany(v => v.Detalles)
                .GroupBy(d => d.ProductoId)
                .Select(g => new ProductoVendidoDto
                {
                    ProductoId = g.Key,
                    Nombre = g.First().Nombre,
                    Unidades = g.Sum(d => d.Cantidad),
                    Total = g.Sum(d => d.Cantidad * d.Precio)
                })
                .OrderByDescending(p => p.Unidades)
                .ThenByDescending(p => p.Total)
                .Take(5)
                .ToList();
            for (var i = 0; i < productos.Count; i++) productos[i].Lugar = i + 1;

            var total = validas.Sum(v => v.Total);
            var reporte = new ReporteVendedorDto
            {
                Tienda = Nombres.Tienda(vendedor),
                Desde = Validaciones.Texto(inicio),
                Hasta = Validaciones.Texto(fin),
                TotalVentas = total,
                Pedidos = validas.Count,
                Cancelados = ventas.Count - validas.Count,
                VentaPromedio = validas.Count > 0 ? (int)Math.Round((double)total / validas.Count) : 0,
                CalificacionPromedio = notas.Count > 0 ? Math.Round((decimal)notas.Average(), 1) : 0,
                Resenas = notas.Count,
                Calificaciones = Distribucion(notas),
                VentasPorMes = PorMes(validas, inicio, fin),
                ProductosMasVendidos = productos
            };
            return Ok(RespuestaApi.Exito("Reporte generado.", reporte));
        }

        // GET /api/reportes/plataforma?desde=2026-06-01&hasta=2026-11-16
        [HttpGet("/api/reportes/plataforma")]
        public async Task<IActionResult> GetReportePlataforma([FromQuery] string desde, [FromQuery] string hasta)
        {
            var errores = LeerPeriodo(desde, hasta, out var inicio, out var fin);
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Período inválido.", errores));

            var ventas = await _context.Ventas
                .Include(v => v.Vendedor).ThenInclude(u => u.Compania)
                .Where(v => v.Fecha >= inicio && v.Fecha <= fin)
                .ToListAsync();
            var validas = ventas.Where(v => v.EstadoTransaccion != "Cancelada").ToList();
            var usuarios = await _context.Usuarios.ToListAsync();

            var tiendas = validas
                .GroupBy(v => v.VendedorId)
                .Select(g => new TiendaVentasDto
                {
                    VendedorId = g.Key,
                    Tienda = Nombres.Tienda(g.First().Vendedor),
                    Pedidos = g.Count(),
                    Total = g.Sum(v => v.Total)
                })
                .OrderByDescending(t => t.Total)
                .Take(5)
                .ToList();
            for (var i = 0; i < tiendas.Count; i++) tiendas[i].Lugar = i + 1;

            var total = validas.Sum(v => v.Total);
            var reporte = new ReportePlataformaDto
            {
                Desde = Validaciones.Texto(inicio),
                Hasta = Validaciones.Texto(fin),
                TotalVentas = total,
                Pedidos = validas.Count,
                Cancelados = ventas.Count - validas.Count,
                VentaPromedio = validas.Count > 0 ? (int)Math.Round((double)total / validas.Count) : 0,
                Usuarios = usuarios.Count,
                UsuariosNuevos = usuarios.Count(u => u.FechaIngreso >= inicio && u.FechaIngreso <= fin),
                Clientes = usuarios.Count(u => u.EsCliente),
                Emprendedores = usuarios.Count(u => u.EsVendedor),
                Administradores = usuarios.Count(u => u.EsAdmin),
                EmprendedoresConVentas = validas.Select(v => v.VendedorId).Distinct().Count(),
                VentasPorMes = PorMes(validas, inicio, fin),
                TiendasMasVendedoras = tiendas,
                Alertas = await Alertas()
            };
            return Ok(RespuestaApi.Exito("Reporte generado.", reporte));
        }

        // si no llegan fechas se toman los ultimos 6 meses, contando el actual
        private static List<string> LeerPeriodo(string desde, string hasta, out DateOnly inicio, out DateOnly fin)
        {
            var errores = new List<string>();
            var hoy = Validaciones.Hoy();
            fin = hoy;
            inicio = new DateOnly(hoy.Year, hoy.Month, 1).AddMonths(-5);

            if (!string.IsNullOrEmpty(hasta) && !Validaciones.LeerFecha(hasta, out fin))
                errores.Add("La fecha hasta debe tener el formato AAAA-MM-DD.");
            if (!string.IsNullOrEmpty(desde) && !Validaciones.LeerFecha(desde, out inicio))
                errores.Add("La fecha desde debe tener el formato AAAA-MM-DD.");
            if (errores.Count > 0) return errores;

            if (fin > hoy) errores.Add("La fecha hasta no puede ser futura.");
            if (inicio > fin) errores.Add("La fecha desde no puede ser posterior a la fecha hasta.");
            else if ((fin.Year - inicio.Year) * 12 + fin.Month - inicio.Month + 1 > MesesMaximos)
                errores.Add($"El período puede abarcar como máximo {MesesMaximos} meses.");
            return errores;
        }

        private static List<VentaMesDto> PorMes(List<Venta> ventas, DateOnly inicio, DateOnly fin)
        {
            var meses = new List<VentaMesDto>();
            var mes = new DateOnly(inicio.Year, inicio.Month, 1);
            while (mes <= fin)
            {
                var delMes = ventas.Where(v => v.Fecha.Year == mes.Year && v.Fecha.Month == mes.Month).ToList();
                meses.Add(new VentaMesDto
                {
                    Mes = mes.ToString("yyyy-MM"),
                    Etiqueta = NombresMes[mes.Month - 1],
                    Pedidos = delMes.Count,
                    Total = delMes.Sum(v => v.Total)
                });
                mes = mes.AddMonths(1);
            }
            return meses;
        }

        private static List<NotaCantidadDto> Distribucion(List<int> notas)
        {
            var lista = new List<NotaCantidadDto>();
            for (var estrellas = 5; estrellas >= 1; estrellas--)
            {
                var cantidad = notas.Count(n => n == estrellas);
                lista.Add(new NotaCantidadDto
                {
                    Estrellas = estrellas,
                    Cantidad = cantidad,
                    Porcentaje = notas.Count > 0 ? (int)Math.Round(100.0 * cantidad / notas.Count) : 0
                });
            }
            return lista;
        }

        private async Task<List<string>> Alertas()
        {
            var alertas = new List<string>();
            var stockBajo = await _context.Productos.CountAsync(p => p.Tipo == "Producto" && p.Estado != "Borrador" && p.Stock <= 3);
            var devoluciones = await _context.Devoluciones.CountAsync(d => d.Estado == "Pendiente");
            var cotizaciones = await _context.Cotizaciones.CountAsync(c => c.Estado == "Pendiente");
            var preguntas = await _context.Preguntas.CountAsync(p => p.Respuesta == null || p.Respuesta == "");

            if (stockBajo > 0) alertas.Add(Plural(stockBajo, "publicación tiene", "publicaciones tienen") + " stock bajo o sin stock.");
            if (devoluciones > 0) alertas.Add(Plural(devoluciones, "devolución espera", "devoluciones esperan") + " la respuesta del emprendedor.");
            if (cotizaciones > 0) alertas.Add(Plural(cotizaciones, "cotización sigue", "cotizaciones siguen") + " sin responder.");
            if (preguntas > 0) alertas.Add(Plural(preguntas, "pregunta de cliente sigue", "preguntas de clientes siguen") + " sin respuesta.");
            return alertas;
        }

        private static string Plural(int cantidad, string singular, string plural)
        {
            return cantidad + " " + (cantidad == 1 ? singular : plural);
        }
    }
}
