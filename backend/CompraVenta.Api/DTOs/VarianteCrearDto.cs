using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class VarianteCrearDto
    {
        // al editar se manda el id de la variante que ya existia; las nuevas van sin id
        public int? Id { get; set; }

        [StringLength(20, ErrorMessage = "La talla no puede tener más de 20 caracteres.")]
        public string Talla { get; set; }

        [StringLength(40, ErrorMessage = "El color de la variante no puede tener más de 40 caracteres.")]
        public string Color { get; set; }

        [Required(ErrorMessage = "Cada variante necesita su SKU.")]
        [StringLength(20, ErrorMessage = "El SKU de la variante no puede tener más de 20 caracteres.")]
        public string Sku { get; set; }

        [Range(0, 100000, ErrorMessage = "El stock de cada variante debe estar entre 0 y 100.000.")]
        public int Stock { get; set; }

        [Range(1, 100000000, ErrorMessage = "El precio de cada variante debe ser mayor a $0.")]
        public int Precio { get; set; }
    }
}
