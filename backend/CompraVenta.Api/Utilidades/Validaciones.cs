using System.Globalization;
using System.Text.RegularExpressions;

namespace CompraVenta.Api.Utilidades
{
    public static class Validaciones
    {
        public const string FormatoCorreo = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";

        public static bool EsCorreo(string correo)
        {
            return !string.IsNullOrWhiteSpace(correo) && Regex.IsMatch(correo.Trim(), FormatoCorreo);
        }

        public static string SoloDigitos(string texto)
        {
            if (texto == null) return "";
            return new string(texto.Where(char.IsDigit).ToArray());
        }

        public static bool LeerFecha(string texto, out DateOnly fecha)
        {
            return DateOnly.TryParseExact(texto, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fecha);
        }

        public static DateOnly Hoy()
        {
            return DateOnly.FromDateTime(DateTime.Now);
        }

        public static string Texto(DateOnly fecha)
        {
            return fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        public static string Texto(DateOnly? fecha)
        {
            if (fecha == null) return "";
            return Texto(fecha.Value);
        }

        public static string Precio(int valor)
        {
            return "$" + valor.ToString("N0", CultureInfo.InvariantCulture).Replace(",", ".");
        }
    }
}
