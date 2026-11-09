namespace CompraVenta.Api.DTOs
{
    public class CalificacionDto
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public int ProductoId { get; set; }
        public int VendedorId { get; set; }
        public int ClienteId { get; set; }
        public int NotaProducto { get; set; }
        public int NotaVendedor { get; set; }
        public string Comentario { get; set; }
        public string Fecha { get; set; }
        public string Cliente { get; set; }
    }
}
