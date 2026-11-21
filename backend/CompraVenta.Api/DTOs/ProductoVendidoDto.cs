namespace CompraVenta.Api.DTOs
{
    public class ProductoVendidoDto
    {
        public int Lugar { get; set; }
        public int? ProductoId { get; set; }
        public string Nombre { get; set; }
        public int Unidades { get; set; }
        public int Total { get; set; }
    }
}
