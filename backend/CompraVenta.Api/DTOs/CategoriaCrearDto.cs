using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class CategoriaCrearDto
    {
        [Required(ErrorMessage = "El nombre de la categoría es obligatorio.")]
        [StringLength(40, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 40 caracteres.")]
        [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Usa solo letras y espacios, sin números ni símbolos.")]
        public string Nombre { get; set; }

        public int? PadreId { get; set; }
    }
}
