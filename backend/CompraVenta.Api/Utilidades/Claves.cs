using System.Security.Cryptography;

namespace CompraVenta.Api.Utilidades
{
    // el frontend manda la clave ya cifrada con bcrypt (src/utils/clave.js)
    // y aca se vuelve a cifrar antes de guardarla
    public static class Claves
    {
        public const string FormatoCifrado = @"^\$2[aby]\$10\$[./A-Za-z0-9]{53}$";
        public const string MensajeSinCifrar = "La clave debe llegar cifrada desde el frontend, no en texto plano.";

        // misma sal que arma el frontend a partir del RUN
        public static string SalDelRun(string run)
        {
            var sal = ("CompraVenta" + Rut.Limpiar(run)).PadRight(21, '.').Substring(0, 21);
            return "$2b$10$" + sal + ".";
        }

        // clave temporal al azar, por ejemplo K7PR-M2QW (sin 0, O, 1 ni I para que no se confundan)
        // se muestra una sola vez al administrador y la persona la cambia al entrar
        public static string Temporal()
        {
            const string letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var bytes = RandomNumberGenerator.GetBytes(8);
            var texto = new string(bytes.Select(b => letras[b % letras.Length]).ToArray());
            return texto.Substring(0, 4) + "-" + texto.Substring(4);
        }

        // se usa para la clave temporal que crea el administrador
        public static string CifrarComoFrontend(string run, string clave)
        {
            return BCrypt.Net.BCrypt.HashPassword(clave, SalDelRun(run));
        }
    }
}
