namespace CompraVenta.Api.DTOs
{
    public class RespuestaCotizacionDto
    {
        public List<PrecioCotizacionDto> Precios { get; set; }
        public int Total { get; set; }
        public string Comentario { get; set; }
        public string Fecha { get; set; }
        public string Vigencia { get; set; }

        // solo cuando la cotizacion expiro: precio reajustado y fecha en que se elimina
        public int? TotalReajustado { get; set; }
        public int? SemanasReajuste { get; set; }
        public decimal? ReajusteSemanal { get; set; }
        public string EliminaEl { get; set; }
    }
}
