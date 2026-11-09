using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("run")]
        public string Run { get; set; }

        [Column("nombres")]
        public string Nombres { get; set; }

        [Column("apellidos")]
        public string Apellidos { get; set; }

        [Column("correo")]
        public string Correo { get; set; }

        [Column("fecha_nacimiento")]
        public DateOnly? FechaNacimiento { get; set; }

        [Column("fecha_ingreso")]
        public DateOnly FechaIngreso { get; set; }

        [Column("clave_hash")]
        public string ClaveHash { get; set; }

        [Column("es_cliente")]
        public bool EsCliente { get; set; }

        [Column("es_vendedor")]
        public bool EsVendedor { get; set; }

        [Column("es_admin")]
        public bool EsAdmin { get; set; }

        [Column("compania_id")]
        public int? CompaniaId { get; set; }

        [ForeignKey("CompaniaId")]
        public Compania Compania { get; set; }
    }
}
