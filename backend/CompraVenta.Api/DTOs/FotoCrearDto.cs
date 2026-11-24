using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class FotoCrearDto
    {
        [Required(ErrorMessage = "El tipo de la foto es obligatorio.")]
        public string Tipo { get; set; }

        // la imagen en base64 (sin el "data:image/...;base64,")
        [Required(ErrorMessage = "La foto es obligatoria.")]
        public string Datos { get; set; }
    }
}
