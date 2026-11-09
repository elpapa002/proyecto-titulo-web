using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class CostoEnvioCrearDto
    {
        public int VendedorId { get; set; }

        [Required(ErrorMessage = "La comuna es obligatoria.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "La comuna debe tener entre 2 y 50 caracteres.")]
        public string Comuna { get; set; }

        [Range(0, 50000, ErrorMessage = "El costo debe estar entre $0 y $50.000.")]
        public int Costo { get; set; }

        [Range(1, 30, ErrorMessage = "Los días de entrega deben estar entre 1 y 30.")]
        public int Dias { get; set; }
    }
}
