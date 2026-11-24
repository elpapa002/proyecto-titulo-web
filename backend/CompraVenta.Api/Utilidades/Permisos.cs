namespace CompraVenta.Api.Utilidades
{
    // revisa las rutas que llevan el id de una persona en la URL
    public static class Permisos
    {
        // de un emprendedor, cualquier usuario con sesion puede ver sus publicaciones, ofertas y costos de envio
        private static readonly string[] DatosPublicosDelVendedor = { "productos", "ofertas", "envios" };

        public static bool EsDelUsuario(string ruta, string metodo, int usuarioId)
        {
            var partes = ruta.Trim('/').Split('/');
            if (partes.Length < 3 || partes[0] != "api") return true;
            var recurso = partes[1];

            if (recurso == "usuarios" || recurso == "clientes")
                return !int.TryParse(partes[2], out var id) || id == usuarioId;

            if (recurso == "vendedores")
            {
                if (metodo == "GET" && partes.Length >= 4 && DatosPublicosDelVendedor.Contains(partes[3])) return true;
                return !int.TryParse(partes[2], out var id) || id == usuarioId;
            }

            // una conversacion la pueden ver el cliente y el emprendedor que participan
            if (recurso == "conversaciones" && partes.Length >= 4
                && int.TryParse(partes[2], out var clienteId) && int.TryParse(partes[3], out var vendedorId))
                return clienteId == usuarioId || vendedorId == usuarioId;

            return true;
        }
    }
}
