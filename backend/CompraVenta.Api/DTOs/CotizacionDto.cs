namespace CompraVenta.Api.DTOs
{
    public class CotizacionDto
    {
        public int Id { get; set; }
        public int ClienteId { get; set; }
        public int VendedorId { get; set; }
        public string Fecha { get; set; }
        public List<ItemCotizacionDto> Items { get; set; }
        public string Mensaje { get; set; }
        public string FechaRequerida { get; set; }
        public string Estado { get; set; }
        public RespuestaCotizacionDto Respuesta { get; set; }
        public string Cliente { get; set; }
        public string Tienda { get; set; }
    }
}
