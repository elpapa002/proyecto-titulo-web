using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class CambioClaveDto
    {
        public string Run { get; set; }

        [Required(ErrorMessage = "La clave actual es obligatoria.")]
        [StringLength(72, ErrorMessage = "La clave actual no puede tener más de 72 caracteres.")]
        public string ClaveActual { get; set; }

        [Required(ErrorMessage = "La clave nueva es obligatoria.")]
        [StringLength(72, MinimumLength = 8, ErrorMessage = "La clave nueva debe tener entre 8 y 72 caracteres.")]
        public string ClaveNueva { get; set; }
    }
}
