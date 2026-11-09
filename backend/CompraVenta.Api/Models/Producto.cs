using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("producto")]
    public class Producto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [ForeignKey("VendedorId")]
        public Usuario Vendedor { get; set; }

        [Column("tipo")]
        public string Tipo { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("sku")]
        public string Sku { get; set; }

        [Column("categoria_id")]
        public int CategoriaId { get; set; }

        [Column("subcategoria_id")]
        public int SubcategoriaId { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; }

        [Column("material")]
        public string Material { get; set; }

        [Column("peso")]
        public string Peso { get; set; }

        [Column("tamano")]
        public string Tamano { get; set; }

        [Column("color")]
        public string Color { get; set; }

        [Column("duracion")]
        public string Duracion { get; set; }

        [Column("edad_minima")]
        public int EdadMinima { get; set; }

        [Column("precio")]
        public int Precio { get; set; }

        [Column("stock")]
        public int Stock { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("calificacion", TypeName = "numeric(2,1)")]
        public decimal Calificacion { get; set; }

        [Column("resenas")]
        public int Resenas { get; set; }

        public List<Oferta> Ofertas { get; set; } = new List<Oferta>();
    }
}
