namespace CompraVenta.Api.DTOs
{
    public class NotificacionDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Texto { get; set; }
        public string Fecha { get; set; }
        public bool Leida { get; set; }
        public string Ruta { get; set; }
    }
}
