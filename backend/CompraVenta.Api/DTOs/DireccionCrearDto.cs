using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class DireccionCrearDto
    {
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "La calle es obligatoria.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "La calle debe tener entre 2 y 100 caracteres.")]
        public string Calle { get; set; }

        [Required(ErrorMessage = "El número es obligatorio.")]
        [StringLength(10, ErrorMessage = "El número no puede tener más de 10 caracteres.")]
        public string Numero { get; set; }

        [Required(ErrorMessage = "La comuna es obligatoria.")]
        [StringLength(50, ErrorMessage = "La comuna no puede tener más de 50 caracteres.")]
        public string Comuna { get; set; }

        [RegularExpression(@"^(\d{7})?$", ErrorMessage = "El código postal debe tener 7 dígitos.")]
        public string CodigoPostal { get; set; }

        public bool Principal { get; set; }
    }
}
