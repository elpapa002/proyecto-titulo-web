namespace CompraVenta.Api.DTOs
{
    public class ConversacionDto
    {
        public int ClienteId { get; set; }
        public int VendedorId { get; set; }
        public string Nombre { get; set; }
        public string Ultimo { get; set; }
        public string Fecha { get; set; }
    }
}
