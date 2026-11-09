namespace CompraVenta.Api.DTOs
{
    public class RespuestaCotizacionDto
    {
        public List<PrecioCotizacionDto> Precios { get; set; }
        public int Total { get; set; }
        public string Comentario { get; set; }
        public string Fecha { get; set; }
        public string Vigencia { get; set; }
    }
}
