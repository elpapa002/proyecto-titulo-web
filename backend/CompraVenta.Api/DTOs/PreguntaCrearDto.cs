using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class PreguntaCrearDto
    {
        public int ProductoId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente que pregunta.")]
        public int ClienteId { get; set; }

        [Required(ErrorMessage = "La pregunta es obligatoria.")]
        [StringLength(500, MinimumLength = 3, ErrorMessage = "La pregunta debe tener entre 3 y 500 caracteres.")]
        public string Texto { get; set; }
    }
}
