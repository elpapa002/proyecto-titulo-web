using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class UsuarioEditarDto
    {
        [StringLength(12, ErrorMessage = "El RUN no puede tener más de 12 caracteres.")]
        public string Run { get; set; }

        [StringLength(120, ErrorMessage = "El correo no puede tener más de 120 caracteres.")]
        [RegularExpression(Validaciones.FormatoCorreo, ErrorMessage = "El correo no tiene un formato válido.")]
        public string Correo { get; set; }

        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los nombres deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los nombres solo pueden tener letras.")]
        public string Nombres { get; set; }

        [StringLength(100, MinimumLength = 2, ErrorMessage = "Los apellidos deben tener entre 2 y 100 caracteres.")]
        [RegularExpression(@"^[\p{L}\s'\-]+$", ErrorMessage = "Los apellidos solo pueden tener letras.")]
        public string Apellidos { get; set; }

        public string FechaNacimiento { get; set; }

        public List<string> Roles { get; set; }

        public int? CompaniaId { get; set; }
    }
}
