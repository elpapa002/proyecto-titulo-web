namespace CompraVenta.Api.DTOs
{
    public class ReporteVendedorDto
    {
        public string Tienda { get; set; }
        public string Desde { get; set; }
        public string Hasta { get; set; }
        public int TotalVentas { get; set; }
        public int Pedidos { get; set; }
        public int Cancelados { get; set; }
        public int VentaPromedio { get; set; }
        public decimal CalificacionPromedio { get; set; }
        public int Resenas { get; set; }
        public List<NotaCantidadDto> Calificaciones { get; set; }
        public List<VentaMesDto> VentasPorMes { get; set; }
        public List<ProductoVendidoDto> ProductosMasVendidos { get; set; }
    }
}
