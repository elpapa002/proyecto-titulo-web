using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class TelefonoCrearDto
    {
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "El número de teléfono es obligatorio.")]
        [StringLength(20, ErrorMessage = "El teléfono no puede tener más de 20 caracteres.")]
        public string Numero { get; set; }
    }
}
