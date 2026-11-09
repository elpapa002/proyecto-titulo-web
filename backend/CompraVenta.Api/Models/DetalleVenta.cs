using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("detalle_venta")]
    public class DetalleVenta
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("venta_id")]
        public int VentaId { get; set; }

        [Column("producto_id")]
        public int? ProductoId { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio")]
        public int Precio { get; set; }
    }
}
