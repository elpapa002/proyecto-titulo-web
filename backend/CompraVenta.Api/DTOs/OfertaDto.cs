namespace CompraVenta.Api.DTOs
{
    public class OfertaDto
    {
        public int Id { get; set; }
        public int VendedorId { get; set; }
        public int ProductoId { get; set; }
        public int PrecioOferta { get; set; }
        public string Inicio { get; set; }
        public string Fin { get; set; }
        public bool Difundir { get; set; }
        public string NombreProducto { get; set; }
        public int Precio { get; set; }
    }
}
