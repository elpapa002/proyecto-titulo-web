namespace CompraVenta.Api.DTOs
{
    public class DireccionDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Calle { get; set; }
        public string Numero { get; set; }
        public string Comuna { get; set; }
        public string CodigoPostal { get; set; }
        public bool Principal { get; set; }
    }
}
