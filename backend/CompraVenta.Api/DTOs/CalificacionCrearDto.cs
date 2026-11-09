using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class CalificacionCrearDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Falta la compra que se califica.")]
        public int VentaId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el producto que se califica.")]
        public int ProductoId { get; set; }

        public int VendedorId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Falta el cliente que califica.")]
        public int ClienteId { get; set; }

        [Range(1, 5, ErrorMessage = "La nota del producto debe estar entre 1 y 5.")]
        public int NotaProducto { get; set; }

        [Range(1, 5, ErrorMessage = "La nota del vendedor debe estar entre 1 y 5.")]
        public int NotaVendedor { get; set; }

        [Required(ErrorMessage = "El comentario es obligatorio.")]
        [StringLength(300, MinimumLength = 10, ErrorMessage = "El comentario debe tener entre 10 y 300 caracteres.")]
        public string Comentario { get; set; }
    }
}
