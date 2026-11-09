using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("notificacion")]
    public class Notificacion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Column("texto")]
        public string Texto { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }

        [Column("leida")]
        public bool Leida { get; set; }

        [Column("ruta")]
        public string Ruta { get; set; }
    }
}
