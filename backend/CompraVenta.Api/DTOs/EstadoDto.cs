using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class EstadoDto
    {
        [Required(ErrorMessage = "El estado es obligatorio.")]
        public string Estado { get; set; }
    }
}
