using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class RegistroDto
    {
        [Required(ErrorMessage = "El RUN es obligatorio.")]
        [StringLength(12, ErrorMessage = "El RUN no puede tener más de 12 caracteres.")]
        public string Run { get; set; }

        [Required(ErrorMessage = "Los nombres son obligatorios.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los nombres deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los nombres solo pueden tener letras.")]
        public string Nombres { get; set; }

        [Required(ErrorMessage = "Los apellidos son obligatorios.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los apellidos deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los apellidos solo pueden tener letras.")]
        public string Apellidos { get; set; }

        [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
        public string FechaNacimiento { get; set; }

        [Required(ErrorMessage = "La clave es obligatoria.")]
        [StringLength(72, MinimumLength = 8, ErrorMessage = "La clave debe tener entre 8 y 72 caracteres.")]
        public string Clave { get; set; }

        [Required(ErrorMessage = "Debe elegir al menos un rol.")]
        [MinLength(1, ErrorMessage = "Debe elegir al menos un rol.")]
        public List<string> Roles { get; set; }

        public List<string> Telefonos { get; set; } = new List<string>();

        [Required(ErrorMessage = "Debe ingresar al menos un correo.")]
        [MinLength(1, ErrorMessage = "Debe ingresar al menos un correo.")]
        public List<string> Correos { get; set; }

        [Required(ErrorMessage = "Debe ingresar al menos una dirección.")]
        [MinLength(1, ErrorMessage = "Debe ingresar al menos una dirección.")]
        public List<DireccionCrearDto> Direcciones { get; set; }

        public CompaniaCrearDto Empresa { get; set; }
    }
}
