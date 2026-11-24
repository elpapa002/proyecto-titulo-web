using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("producto_relacionado")]
    public class ProductoRelacionado
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("relacionado_id")]
        public int RelacionadoId { get; set; }
    }
}
