using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class CotizacionCrearDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente de la cotización.")]
        public int ClienteId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el vendedor de la cotización.")]
        public int VendedorId { get; set; }

        [Required(ErrorMessage = "La cotización debe tener al menos un producto.")]
        [MinLength(1, ErrorMessage = "La cotización debe tener al menos un producto.")]
        public List<ItemCotizacionDto> Items { get; set; }

        [Required(ErrorMessage = "El mensaje es obligatorio.")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "El mensaje debe tener entre 10 y 500 caracteres.")]
        public string Mensaje { get; set; }

        public string FechaRequerida { get; set; }
    }
}
