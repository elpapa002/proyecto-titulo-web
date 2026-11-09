namespace CompraVenta.Api.DTOs
{
    public class VentaDto
    {
        public int Id { get; set; }
        public int ClienteId { get; set; }
        public int VendedorId { get; set; }
        public string Fecha { get; set; }
        public List<ItemVentaDto> Items { get; set; }
        public int Envio { get; set; }
        public int Total { get; set; }
        public MedioPagoDto MedioPago { get; set; }
        public string EstadoTransaccion { get; set; }
        public string EstadoPedido { get; set; }
        public string Direccion { get; set; }
        public string EmpresaTransporte { get; set; }
        public string Seguimiento { get; set; }
        public bool Calificada { get; set; }
        public string Cliente { get; set; }
        public string Tienda { get; set; }
    }
}
