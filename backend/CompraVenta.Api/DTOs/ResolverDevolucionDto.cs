using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ResolverDevolucionDto
    {
        [Required(ErrorMessage = "El estado es obligatorio.")]
        [RegularExpression("^(Aprobada|Rechazada)$", ErrorMessage = "El estado debe ser Aprobada o Rechazada.")]
        public string Estado { get; set; }

        [Required(ErrorMessage = "Escribe una respuesta para el cliente.")]
        [StringLength(300, MinimumLength = 10, ErrorMessage = "La respuesta debe tener entre 10 y 300 caracteres.")]
        public string Respuesta { get; set; }

        public bool ReponerStock { get; set; }
    }
}
