namespace CompraVenta.Api.DTOs
{
    public class VarianteDto
    {
        public int Id { get; set; }
        public string Talla { get; set; }
        public string Color { get; set; }
        public string Sku { get; set; }
        public int Stock { get; set; }
        public int Precio { get; set; }
        // precio con la oferta vigente del producto (null si no hay oferta)
        public int? PrecioOferta { get; set; }
    }
}
