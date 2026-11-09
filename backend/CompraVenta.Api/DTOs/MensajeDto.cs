namespace CompraVenta.Api.DTOs
{
    public class MensajeDto
    {
        public int Id { get; set; }
        public int ClienteId { get; set; }
        public int VendedorId { get; set; }
        public int AutorId { get; set; }
        public string Texto { get; set; }
        public string Fecha { get; set; }
    }
}
