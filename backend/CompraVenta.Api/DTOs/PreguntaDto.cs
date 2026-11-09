namespace CompraVenta.Api.DTOs
{
    public class PreguntaDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public int ClienteId { get; set; }
        public string Texto { get; set; }
        public string Fecha { get; set; }
        public string Respuesta { get; set; }
        public string FechaRespuesta { get; set; }
        public string Cliente { get; set; }
        public string NombreProducto { get; set; }
    }
}
