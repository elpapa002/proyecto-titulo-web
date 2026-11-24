using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ConfiguracionEnvioDto
    {
        public int VendedorId { get; set; }

        [Required(ErrorMessage = "Elige la forma de cálculo del envío.")]
        [RegularExpression("^(Comuna|Peso)$", ErrorMessage = "La forma de cálculo debe ser Comuna o Peso.")]
        public string Forma { get; set; }

        [Range(0, 100000, ErrorMessage = "El costo base debe estar entre $0 y $100.000.")]
        public int CostoBase { get; set; }

        [Range(0, 50000, ErrorMessage = "El costo por kilo adicional debe estar entre $0 y $50.000.")]
        public int CostoKilo { get; set; }

        [StringLength(40, ErrorMessage = "El tamaño máximo no puede tener más de 40 caracteres.")]
        public string TamanoMaximo { get; set; }

        public bool RetiroLocal { get; set; }

        [StringLength(150, ErrorMessage = "La dirección de retiro no puede tener más de 150 caracteres.")]
        public string DireccionRetiro { get; set; }
    }
}
