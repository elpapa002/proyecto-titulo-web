using System.Text.Json.Serialization;

namespace CompraVenta.Api.DTOs
{
    public class UsuarioDto
    {
        // solo viene al crear un usuario o restablecer su clave desde el administrador
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string ClaveTemporal { get; set; }

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
