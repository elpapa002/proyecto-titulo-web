using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class DevolucionCrearDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Falta la compra que se devuelve.")]
        public int VentaId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente que pide la devolución.")]
        public int ClienteId { get; set; }

        public int VendedorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el producto que se devuelve.")]
        public int ProductoId { get; set; }

        public string NombreProducto { get; set; }

        [Range(1, 1000, ErrorMessage = "La cantidad debe ser al menos 1.")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "El motivo es obligatorio.")]
        [RegularExpression("^(Llegó con un defecto|No es lo que pedí|Llegó incompleto|Otro)$", ErrorMessage = "El motivo debe ser Llegó con un defecto, No es lo que pedí, Llegó incompleto u Otro.")]
        public string Motivo { get; set; }

        [Required(ErrorMessage = "Cuenta qué pasó en el detalle.")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "El detalle debe tener entre 10 y 500 caracteres.")]
        public string Detalle { get; set; }

        public int Monto { get; set; }
    }
}
