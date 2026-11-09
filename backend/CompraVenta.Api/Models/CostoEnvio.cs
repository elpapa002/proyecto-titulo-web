using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("costo_envio")]
    public class CostoEnvio
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [Column("comuna")]
        public string Comuna { get; set; }

        [Column("costo")]
        public int Costo { get; set; }

        [Column("dias")]
        public int Dias { get; set; }
    }
}
