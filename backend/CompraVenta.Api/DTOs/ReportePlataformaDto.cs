namespace CompraVenta.Api.DTOs
{
    public class ReportePlataformaDto
    {
        public string Desde { get; set; }
        public string Hasta { get; set; }
        public int TotalVentas { get; set; }
        public int Pedidos { get; set; }
        public int Cancelados { get; set; }
        public int VentaPromedio { get; set; }
        public int Usuarios { get; set; }
        public int UsuariosNuevos { get; set; }
        public int Clientes { get; set; }
        public int Emprendedores { get; set; }
        public int Administradores { get; set; }
        public int EmprendedoresConVentas { get; set; }
        public List<VentaMesDto> VentasPorMes { get; set; }
        public List<TiendaVentasDto> TiendasMasVendedoras { get; set; }
        public List<string> Alertas { get; set; }
    }
}
