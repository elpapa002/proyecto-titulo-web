using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class VentaCrearDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente de la compra.")]
        public int ClienteId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el vendedor de la compra.")]
        public int VendedorId { get; set; }

        [Required(ErrorMessage = "La compra debe tener al menos un producto.")]
        [MinLength(1, ErrorMessage = "La compra debe tener al menos un producto.")]
        public List<ItemVentaDto> Items { get; set; }

        [Range(0, 1000000, ErrorMessage = "El costo de envío debe estar entre $0 y $1.000.000.")]
        public int Envio { get; set; }

        public int Total { get; set; }

        [Required(ErrorMessage = "El medio de pago es obligatorio.")]
        public MedioPagoDto MedioPago { get; set; }

        [Required(ErrorMessage = "La dirección de despacho es obligatoria.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "La dirección debe tener entre 5 y 200 caracteres.")]
        public string Direccion { get; set; }
    }
}
