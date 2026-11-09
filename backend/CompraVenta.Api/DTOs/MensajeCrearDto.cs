using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class MensajeCrearDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente de la conversación.")]
        public int ClienteId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el vendedor de la conversación.")]
        public int VendedorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el autor del mensaje.")]
        public int AutorId { get; set; }

        [Required(ErrorMessage = "El mensaje no puede estar vacío.")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "El mensaje debe tener entre 1 y 1000 caracteres.")]
        public string Texto { get; set; }
    }
}
