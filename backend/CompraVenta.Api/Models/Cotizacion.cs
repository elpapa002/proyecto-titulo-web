using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("cotizacion")]
    public class Cotizacion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Usuario Cliente { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [ForeignKey("VendedorId")]
        public Usuario Vendedor { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }

        [Column("mensaje")]
        public string Mensaje { get; set; }

        [Column("fecha_requerida")]
        public DateOnly? FechaRequerida { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("respuesta_total")]
        public int? RespuestaTotal { get; set; }

        [Column("respuesta_comentario")]
        public string RespuestaComentario { get; set; }

        [Column("respuesta_fecha")]
        public DateOnly? RespuestaFecha { get; set; }

        [Column("vigencia")]
        public DateOnly? Vigencia { get; set; }

        [ForeignKey("CotizacionId")]
        public List<DetalleCotizacion> Detalles { get; set; } = new List<DetalleCotizacion>();
    }
}
