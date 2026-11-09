using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("categoria")]
    public class Categoria
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("ruta")]
        public string Ruta { get; set; }

        [Column("padre_id")]
        public int? PadreId { get; set; }
    }
}
