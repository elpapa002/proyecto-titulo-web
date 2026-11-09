using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class ResponderCotizacionDto
    {
        [Required(ErrorMessage = "Debe indicar los precios.")]
        [MinLength(1, ErrorMessage = "Debe indicar los precios.")]
        public List<PrecioCotizacionDto> Precios { get; set; }

        [Range(1, 1000000000, ErrorMessage = "El total debe ser mayor a 0.")]
        public int Total { get; set; }

        [StringLength(300, ErrorMessage = "El comentario no puede tener más de 300 caracteres.")]
        public string Comentario { get; set; }
    }
}
