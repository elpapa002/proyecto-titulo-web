using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "El RUN es obligatorio.")]
        [StringLength(12, ErrorMessage = "El RUN no puede tener más de 12 caracteres.")]
        public string Run { get; set; }

        [Required(ErrorMessage = "La clave es obligatoria.")]
        [RegularExpression(Claves.FormatoCifrado, ErrorMessage = Claves.MensajeSinCifrar)]
        public string Clave { get; set; }

        public bool RecordarSesion { get; set; }
    }
}
