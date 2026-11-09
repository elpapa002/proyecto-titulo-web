using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class RespuestaPreguntaDto
    {
        [Required(ErrorMessage = "La respuesta es obligatoria.")]
        [StringLength(500, MinimumLength = 2, ErrorMessage = "La respuesta debe tener entre 2 y 500 caracteres.")]
        public string Respuesta { get; set; }
    }
}
