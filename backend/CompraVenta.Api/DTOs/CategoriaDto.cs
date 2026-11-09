namespace CompraVenta.Api.DTOs
{
    public class CategoriaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Ruta { get; set; }
        public int? PadreId { get; set; }
    }
}
