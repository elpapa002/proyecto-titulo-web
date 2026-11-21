using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class CambioClaveDto
    {
        public string Run { get; set; }

        [Required(ErrorMessage = "La clave actual es obligatoria.")]
        [RegularExpression(Claves.FormatoCifrado, ErrorMessage = Claves.MensajeSinCifrar)]
        public string ClaveActual { get; set; }

        [Required(ErrorMessage = "La clave nueva es obligatoria.")]
        [RegularExpression(Claves.FormatoCifrado, ErrorMessage = Claves.MensajeSinCifrar)]
        public string ClaveNueva { get; set; }
    }
}
