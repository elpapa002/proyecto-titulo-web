namespace CompraVenta.Api.Utilidades
{
    public static class Rut
    {
        public static string Limpiar(string rut)
        {
            if (rut == null) return "";
            var limpio = "";
            foreach (var letra in rut.ToUpper())
            {
                if (char.IsDigit(letra) || letra == 'K') limpio += letra;
            }
            return limpio;
        }

        // mismo calculo que en el frontend (modulo 11)
        public static string CalcularDv(string numero)
        {
            var suma = 0;
            var multiplicador = 2;
            for (var i = numero.Length - 1; i >= 0; i--)
            {
                suma += (numero[i] - '0') * multiplicador;
                multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
            }
            var resto = 11 - (suma % 11);
            if (resto == 11) return "0";
            if (resto == 10) return "K";
            return resto.ToString();
        }

        public static bool EsValido(string rut)
        {
            var limpio = Limpiar(rut);
            if (limpio.Length < 8 || limpio.Length > 9) return false;
            var numero = limpio.Substring(0, limpio.Length - 1);
            var dv = limpio.Substring(limpio.Length - 1);
            if (!numero.All(char.IsDigit)) return false;
            return CalcularDv(numero) == dv;
        }

        public static string Formatear(string rut)
        {
            var limpio = Limpiar(rut);
            if (limpio.Length < 2) return rut;
            var numero = limpio.Substring(0, limpio.Length - 1);
            var dv = limpio.Substring(limpio.Length - 1);
            var conPuntos = "";
            var contador = 0;
            for (var i = numero.Length - 1; i >= 0; i--)
            {
                conPuntos = numero[i] + conPuntos;
                contador++;
                if (contador % 3 == 0 && i > 0) conPuntos = "." + conPuntos;
            }
            return conPuntos + "-" + dv;
        }
    }
}
