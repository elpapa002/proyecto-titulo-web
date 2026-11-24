using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("foto")]
    public class Foto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("orden")]
        public int Orden { get; set; }

        [Column("tipo")]
        public string Tipo { get; set; }

        [Column("datos")]
        public byte[] Datos { get; set; }
    }
}
