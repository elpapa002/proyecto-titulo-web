namespace CompraVenta.Api.DTOs
{
    public class ProductoDto
    {
        public int Id { get; set; }
        public int VendedorId { get; set; }
        public string Tipo { get; set; }
        public string Nombre { get; set; }
        public string Sku { get; set; }
        public int CategoriaId { get; set; }
        public int SubcategoriaId { get; set; }
        public string Descripcion { get; set; }
        public string Material { get; set; }
        public string Peso { get; set; }
        public string Tamano { get; set; }
        public string Color { get; set; }
        public int EdadMinima { get; set; }
        public string Duracion { get; set; }
        public int Precio { get; set; }
        public int Stock { get; set; }
        public string Estado { get; set; }
        public decimal Calificacion { get; set; }
        public int Resenas { get; set; }
        public string Tienda { get; set; }
        public int? PrecioOferta { get; set; }
        public string FinOferta { get; set; }
    }
}
