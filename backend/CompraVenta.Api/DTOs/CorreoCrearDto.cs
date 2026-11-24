using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class CorreoCrearDto
    {
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [StringLength(120, ErrorMessage = "El correo no puede tener más de 120 caracteres.")]
        [RegularExpression(Validaciones.FormatoCorreo, ErrorMessage = "El correo no tiene un formato válido.")]
        public string Correo { get; set; }
    }
}
