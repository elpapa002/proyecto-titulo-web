namespace CompraVenta.Api.DTOs
{
    public class CostoEnvioDto
    {
        public int Id { get; set; }
        public int VendedorId { get; set; }
        public string Comuna { get; set; }
        public int Costo { get; set; }
        public int Dias { get; set; }
    }
}
