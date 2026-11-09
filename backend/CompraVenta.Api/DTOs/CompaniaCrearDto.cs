using System.ComponentModel.DataAnnotations;
using CompraVenta.Api.Utilidades;

namespace CompraVenta.Api.DTOs
{
    public class CompaniaCrearDto
    {
        [Required(ErrorMessage = "El RUT de la empresa es obligatorio.")]
        [StringLength(12, ErrorMessage = "El RUT no puede tener más de 12 caracteres.")]
        public string Rut { get; set; }

        [Required(ErrorMessage = "El nombre de la empresa es obligatorio.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre de la empresa debe tener entre 2 y 100 caracteres.")]
        public string Nombre { get; set; }

        [Range(1, 100000, ErrorMessage = "La cantidad de personas debe ser 1 o más.")]
        public int Personas { get; set; }

        [Required(ErrorMessage = "El teléfono de la empresa es obligatorio.")]
        [StringLength(20, ErrorMessage = "El teléfono no puede tener más de 20 caracteres.")]
        public string Telefono { get; set; }

        [Required(ErrorMessage = "El correo de la empresa es obligatorio.")]
        [StringLength(120, ErrorMessage = "El correo no puede tener más de 120 caracteres.")]
        [RegularExpression(Validaciones.FormatoCorreo, ErrorMessage = "El correo de la empresa no tiene un formato válido.")]
        public string Correo { get; set; }

        [StringLength(120, ErrorMessage = "El sitio web no puede tener más de 120 caracteres.")]
        public string SitioWeb { get; set; }

        [StringLength(150, ErrorMessage = "La dirección no puede tener más de 150 caracteres.")]
        public string Direccion { get; set; }
    }
}
