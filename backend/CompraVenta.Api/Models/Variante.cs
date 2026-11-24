using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("variante")]
    public class Variante
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("talla")]
        public string Talla { get; set; }

        [Column("color")]
        public string Color { get; set; }

        [Column("sku")]
        public string Sku { get; set; }

        [Column("stock")]
        public int Stock { get; set; }

        [Column("precio")]
        public int Precio { get; set; }

        // "Talla M · Azul marino", para mostrar en el carro y en la boleta
        public string Texto()
        {
            var partes = new List<string>();
            if (!string.IsNullOrEmpty(Talla)) partes.Add("Talla " + Talla);
            if (!string.IsNullOrEmpty(Color)) partes.Add(Color);
            return string.Join(" · ", partes);
        }
    }
}
