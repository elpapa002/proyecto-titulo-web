using System.Net;

namespace CompraVenta.Api.Utilidades
{
    public static class Red
    {
        // true si la pagina viene de este computador o de una IP de red local (192.168.x.x, 10.x.x.x o 172.16 a 172.31)
        public static bool EsLocal(string origen)
        {
            if (!Uri.TryCreate(origen, UriKind.Absolute, out var uri) || (uri.Scheme != "http" && uri.Scheme != "https")) return false;
            if (uri.Host == "localhost") return true;
            if (!IPAddress.TryParse(uri.Host, out var ip) || ip.AddressFamily != System.Net.Sockets.AddressFamily.InterNetwork) return false;
            var b = ip.GetAddressBytes();
            return b[0] == 127 || b[0] == 10 || (b[0] == 192 && b[1] == 168) || (b[0] == 172 && b[1] >= 16 && b[1] <= 31);
        }
    }
}
