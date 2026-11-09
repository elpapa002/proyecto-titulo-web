using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class PrecioCotizacionDto
    {
        public int? ProductoId { get; set; }

        [Range(1, 100000000, ErrorMessage = "Cada precio debe ser mayor a 0.")]
        public int Precio { get; set; }
    }
}
