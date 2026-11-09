using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("pregunta")]
    public class Pregunta
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [ForeignKey("ProductoId")]
        public Producto Producto { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Usuario Cliente { get; set; }

        [Column("texto")]
        public string Texto { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }

        [Column("respuesta")]
        public string Respuesta { get; set; }

        [Column("fecha_respuesta")]
        public DateOnly? FechaRespuesta { get; set; }
    }
}
