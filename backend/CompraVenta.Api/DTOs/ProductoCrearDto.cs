using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ProductoCrearDto
    {
        public int VendedorId { get; set; }

        [Required(ErrorMessage = "El tipo es obligatorio.")]
        [RegularExpression("^(Producto|Servicio)$", ErrorMessage = "El tipo debe ser Producto o Servicio.")]
        public string Tipo { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
        public string Nombre { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Debe elegir una categoría.")]
        public int CategoriaId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Debe elegir una subcategoría.")]
        public int SubcategoriaId { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "La descripción debe tener entre 10 y 1000 caracteres.")]
        public string Descripcion { get; set; }

        [StringLength(100, ErrorMessage = "El material no puede tener más de 100 caracteres.")]
        public string Material { get; set; }

        [StringLength(30, ErrorMessage = "El peso no puede tener más de 30 caracteres.")]
        public string Peso { get; set; }

        [StringLength(60, ErrorMessage = "El tamaño no puede tener más de 60 caracteres.")]
        public string Tamano { get; set; }

        [StringLength(60, ErrorMessage = "El color no puede tener más de 60 caracteres.")]
        public string Color { get; set; }

        [StringLength(30, ErrorMessage = "La duración no puede tener más de 30 caracteres.")]
        public string Duracion { get; set; }

        [StringLength(20, ErrorMessage = "El SKU no puede tener más de 20 caracteres.")]
        public string Sku { get; set; }

        [Range(0, 100000, ErrorMessage = "El stock debe ser un número entre 0 y 100000.")]
        public int Stock { get; set; }

        [Range(100, 100000000, ErrorMessage = "El precio debe ser de al menos $100.")]
        public int Precio { get; set; }

        [Range(0, 99, ErrorMessage = "La edad mínima debe estar entre 0 y 99.")]
        public int EdadMinima { get; set; }

        [Required(ErrorMessage = "El estado es obligatorio.")]
        [RegularExpression("^(Publicada|Pausada|Borrador)$", ErrorMessage = "El estado debe ser Publicada, Pausada o Borrador.")]
        public string Estado { get; set; }
    }
}
