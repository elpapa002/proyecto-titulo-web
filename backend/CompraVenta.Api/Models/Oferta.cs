using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("oferta")]
    public class Oferta
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [ForeignKey("ProductoId")]
        public Producto Producto { get; set; }

        [Column("precio_oferta")]
        public int PrecioOferta { get; set; }

        [Column("inicio")]
        public DateOnly Inicio { get; set; }

        [Column("fin")]
        public DateOnly Fin { get; set; }

        [Column("difundir")]
        public bool Difundir { get; set; }
    }
}
