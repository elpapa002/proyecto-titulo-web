using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("mensaje")]
    public class Mensaje
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [Column("autor_id")]
        public int AutorId { get; set; }

        [Column("texto")]
        public string Texto { get; set; }

        [Column("fecha", TypeName = "timestamp without time zone")]
        public DateTime Fecha { get; set; }
    }
}
