using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class MedioPagoDto
    {
        [Required(ErrorMessage = "El tipo de medio de pago es obligatorio.")]
        [StringLength(20, ErrorMessage = "El tipo de medio de pago no puede tener más de 20 caracteres.")]
        public string Tipo { get; set; }

        [StringLength(30, ErrorMessage = "La marca no puede tener más de 30 caracteres.")]
        public string Marca { get; set; }

        [RegularExpression(@"^\d{4}$", ErrorMessage = "Los últimos 4 dígitos deben ser 4 números.")]
        public string Ultimos4 { get; set; }
    }
}
