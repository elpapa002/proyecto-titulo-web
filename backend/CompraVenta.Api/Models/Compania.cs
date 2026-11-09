using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("compania")]
    public class Compania
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("rut")]
        public string Rut { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("personas")]
        public int Personas { get; set; }

        [Column("telefono")]
        public string Telefono { get; set; }

        [Column("correo")]
        public string Correo { get; set; }

        [Column("sitio_web")]
        public string SitioWeb { get; set; }

        [Column("direccion")]
        public string Direccion { get; set; }
    }
}
