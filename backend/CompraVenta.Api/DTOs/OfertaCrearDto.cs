using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class OfertaCrearDto
    {
        public int VendedorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Debe elegir un producto.")]
        public int ProductoId { get; set; }

        [Range(1, 100000000, ErrorMessage = "El precio de oferta debe ser mayor a 0.")]
        public int PrecioOferta { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
        public string Inicio { get; set; }

        [Required(ErrorMessage = "La fecha de término es obligatoria.")]
        public string Fin { get; set; }

        public bool? Difundir { get; set; }
    }
}
