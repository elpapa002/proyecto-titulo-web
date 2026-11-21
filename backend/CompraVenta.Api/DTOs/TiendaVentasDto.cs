namespace CompraVenta.Api.DTOs
{
    public class TiendaVentasDto
    {
        public int Lugar { get; set; }
        public int VendedorId { get; set; }
        public string Tienda { get; set; }
        public int Pedidos { get; set; }
        public int Total { get; set; }
    }
}
