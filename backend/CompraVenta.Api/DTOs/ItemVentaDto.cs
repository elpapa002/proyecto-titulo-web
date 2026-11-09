using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ItemVentaDto
    {
        public int? ProductoId { get; set; }

        public string Nombre { get; set; }

        [Range(1, 1000, ErrorMessage = "La cantidad de cada producto debe estar entre 1 y 1000.")]
        public int Cantidad { get; set; }

        public int Precio { get; set; }
    }
}
