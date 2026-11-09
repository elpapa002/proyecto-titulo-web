namespace CompraVenta.Api.DTOs
{
    public class DevolucionDto
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public int ClienteId { get; set; }
        public int VendedorId { get; set; }
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }
        public int Cantidad { get; set; }
        public string Motivo { get; set; }
        public string Detalle { get; set; }
        public string Fecha { get; set; }
        public string Estado { get; set; }
        public string Respuesta { get; set; }
        public int Monto { get; set; }
        public string Cliente { get; set; }
        public string Tienda { get; set; }
    }
}
