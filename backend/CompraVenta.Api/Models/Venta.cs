using System.ComponentModel.DataAnnotations.Schema;

namespace CompraVenta.Api.Models
{
    [Table("venta")]
    public class Venta
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Usuario Cliente { get; set; }

        [Column("vendedor_id")]
        public int VendedorId { get; set; }

        [ForeignKey("VendedorId")]
        public Usuario Vendedor { get; set; }

        [Column("fecha")]
        public DateOnly Fecha { get; set; }

        [Column("envio")]
        public int Envio { get; set; }

        [Column("total")]
        public int Total { get; set; }

        [Column("medio_tipo")]
        public string MedioTipo { get; set; }

        [Column("medio_marca")]
        public string MedioMarca { get; set; }

        [Column("medio_ultimos4")]
        public string MedioUltimos4 { get; set; }

        [Column("estado_transaccion")]
        public string EstadoTransaccion { get; set; }

        [Column("estado_pedido")]
        public string EstadoPedido { get; set; }

        [Column("direccion")]
        public string Direccion { get; set; }

        [Column("empresa_transporte")]
        public string EmpresaTransporte { get; set; }

        [Column("seguimiento")]
        public string Seguimiento { get; set; }

        [Column("calificada")]
        public bool Calificada { get; set; }

        [ForeignKey("VentaId")]
        public List<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
    }
}
