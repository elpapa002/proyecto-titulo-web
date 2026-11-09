using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("calificacion")]
    public class Calificacion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("venta_id")]
        public int VentaId { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Usuario Cliente { get; set; }

        [Column("nota_producto")]
        public int NotaProducto { get; set; }

        [Column("nota_vendedor")]
        public int NotaVendedor { get; set; }

        [Column("comentario")]
        public string Comentario { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }
    }
}
