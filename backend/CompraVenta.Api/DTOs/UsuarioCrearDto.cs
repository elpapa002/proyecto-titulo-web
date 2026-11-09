using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class UsuarioCrearDto
    {
        [Required(ErrorMessage = "El RUN es obligatorio.")]
        [StringLength(12, ErrorMessage = "El RUN no puede tener más de 12 caracteres.")]
        public string Run { get; set; }

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [StringLength(120, ErrorMessage = "El correo no puede tener más de 120 caracteres.")]
        [RegularExpression(Validaciones.FormatoCorreo, ErrorMessage = "El correo no tiene un formato válido.")]
        public string Correo { get; set; }

        [Required(ErrorMessage = "Los nombres son obligatorios.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los nombres deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los nombres solo pueden tener letras.")]
        public string Nombres { get; set; }

        [Required(ErrorMessage = "Los apellidos son obligatorios.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los apellidos deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los apellidos solo pueden tener letras.")]
        public string Apellidos { get; set; }

        [Required(ErrorMessage = "Debe elegir al menos un rol.")]
        [MinLength(1, ErrorMessage = "Debe elegir al menos un rol.")]
        public List<string> Roles { get; set; }

        public int? CompaniaId { get; set; }
    }
}
