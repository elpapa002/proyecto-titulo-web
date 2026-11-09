namespace CompraVenta.Api.DTOs
{
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Run { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Correo { get; set; }
        public string FechaNacimiento { get; set; }
        public string FechaIngreso { get; set; }
        public List<string> Roles { get; set; }
        public int? CompaniaId { get; set; }
    }
}
