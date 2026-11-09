using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ItemCotizacionDto
    {
        public int? ProductoId { get; set; }

        public string Nombre { get; set; }

        [Range(1, 9999, ErrorMessage = "La cantidad de cada producto debe estar entre 1 y 9999.")]
        public int Cantidad { get; set; }
    }
}
