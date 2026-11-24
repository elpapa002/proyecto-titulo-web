namespace CompraVenta.Api.DTOs
{
    public class DisponibilidadRespuestaDto
    {
        public bool RunOcupado { get; set; }
        public List<string> CorreosOcupados { get; set; } = new List<string>();
        public bool RutEmpresaOcupado { get; set; }
    }
}
