using System.Security.Cryptography;
using System.Text;

namespace CompraVenta.Api.Utilidades
{
    // token firmado con HMAC-SHA256: base64url("id|roles|expira") + "." + base64url(firma)
    // si alguien cambia el id, los roles o la fecha, la firma ya no calza y el token se rechaza
    public static class Tokens
    {
        // si no se configura Auth__Secreto en el .env, se crea uno al azar al partir
        // (los tokens dejan de servir cuando se reinicia el backend)
        private static byte[] _secreto = RandomNumberGenerator.GetBytes(32);

        public static void Configurar(string secreto)
        {
            if (!string.IsNullOrWhiteSpace(secreto)) _secreto = Encoding.UTF8.GetBytes(secreto);
        }

        public static string Crear(int usuarioId, IEnumerable<string> roles, int horas = 8)
        {
            var expira = DateTimeOffset.UtcNow.AddHours(horas).ToUnixTimeSeconds();
            var datos = usuarioId + "|" + string.Join(",", roles) + "|" + expira;
            var cuerpo = ABase64Url(Encoding.UTF8.GetBytes(datos));
            return cuerpo + "." + ABase64Url(Firmar(cuerpo));
        }

        public static bool TryLeer(string token, out int usuarioId, out string[] roles)
        {
            usuarioId = 0;
            roles = new string[0];
            if (string.IsNullOrEmpty(token)) return false;
            var partes = token.Split('.');
            if (partes.Length != 2) return false;
            try
            {
                if (!CryptographicOperations.FixedTimeEquals(Firmar(partes[0]), DeBase64Url(partes[1]))) return false;
                var datos = Encoding.UTF8.GetString(DeBase64Url(partes[0])).Split('|');
                if (datos.Length != 3) return false;
                if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > long.Parse(datos[2])) return false;
                usuarioId = int.Parse(datos[0]);
                roles = datos[1] == "" ? new string[0] : datos[1].Split(',');
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static byte[] Firmar(string texto)
        {
            using var hmac = new HMACSHA256(_secreto);
            return hmac.ComputeHash(Encoding.UTF8.GetBytes(texto));
        }

        private static string ABase64Url(byte[] bytes)
        {
            return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }

        private static byte[] DeBase64Url(string texto)
        {
            var base64 = texto.Replace('-', '+').Replace('_', '/');
            if (base64.Length % 4 == 2) base64 += "==";
            else if (base64.Length % 4 == 3) base64 += "=";
            return Convert.FromBase64String(base64);
        }
    }
}
