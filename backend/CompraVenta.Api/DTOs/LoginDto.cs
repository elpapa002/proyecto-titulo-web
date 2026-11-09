using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "El RUN es obligatorio.")]
        [StringLength(12, ErrorMessage = "El RUN no puede tener más de 12 caracteres.")]
        public string Run { get; set; }

        [Required(ErrorMessage = "La clave es obligatoria.")]
        [StringLength(72, ErrorMessage = "La clave no puede tener más de 72 caracteres.")]
        public string Clave { get; set; }

        public bool RecordarSesion { get; set; }
    }
}
