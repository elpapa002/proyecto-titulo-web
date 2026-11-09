namespace CompraVenta.Api.DTOs
{
    public class CategoriaArbolDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Ruta { get; set; }
        public int? PadreId { get; set; }
        public List<CategoriaDto> Subcategorias { get; set; }
    }
}
