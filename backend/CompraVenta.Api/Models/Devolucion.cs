using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("devolucion")]
    public class Devolucion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("venta_id")]
        public int VentaId { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Usuario Cliente { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [ForeignKey("VendedorId")]
        public Usuario Vendedor { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("nombre_producto")]
        public string NombreProducto { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("motivo")]
        public string Motivo { get; set; }

        [Column("detalle")]
        public string Detalle { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("respuesta")]
        public string Respuesta { get; set; }

        [Column("monto")]
        public int Monto { get; set; }
    }
}
