using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("detalle_cotizacion")]
    public class DetalleCotizacion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cotizacion_id")]
        public int CotizacionId { get; set; }

        [Column("producto_id")]
        public int? ProductoId { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio")]
        public int? Precio { get; set; }
    }
}
