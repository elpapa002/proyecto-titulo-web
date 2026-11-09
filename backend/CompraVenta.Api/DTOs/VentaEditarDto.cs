using System.ComponentModel.DataAnnotations;

namespace CompraVenta.Api.DTOs
{
    public class VentaEditarDto
    {
        public string EstadoPedido { get; set; }

        public string EstadoTransaccion { get; set; }

        [StringLength(50, ErrorMessage = "La empresa de transporte no puede tener más de 50 caracteres.")]
        public string EmpresaTransporte { get; set; }

        [StringLength(50, ErrorMessage = "El número de seguimiento no puede tener más de 50 caracteres.")]
        public string Seguimiento { get; set; }
    }
}
