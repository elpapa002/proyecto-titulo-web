using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("direccion")]
    public class Direccion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Column("calle")]
        public string Calle { get; set; }

        [Column("numero")]
        public string Numero { get; set; }

        [Column("comuna")]
        public string Comuna { get; set; }

        [Column("codigo_postal")]
        public string CodigoPostal { get; set; }

        [Column("principal")]
        public bool Principal { get; set; }
    }
}
