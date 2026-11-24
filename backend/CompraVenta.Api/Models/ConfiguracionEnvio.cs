using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("configuracion_envio")]
    public class ConfiguracionEnvio
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        // Comuna: se cobra lo que diga la tabla costo_envio. Peso: costo base + costo por kilo adicional
        [Column("forma")]
        public string Forma { get; set; } = "Comuna";

        [Column("costo_base")]
        public int CostoBase { get; set; }

        [Column("costo_kilo")]
        public int CostoKilo { get; set; }

        [Column("tamano_maximo")]
        public string TamanoMaximo { get; set; } = "";

        [Column("retiro_local")]
        public bool RetiroLocal { get; set; }

        [Column("direccion_retiro")]
        public string DireccionRetiro { get; set; } = "";
    }
}
