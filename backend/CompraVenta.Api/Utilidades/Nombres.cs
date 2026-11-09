using CompraVenta.Api.Models;

namespace CompraVenta.Api.Utilidades
{
    public static class Nombres
    {
        private static string PrimeraPalabra(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return "";
            return texto.Trim().Split(' ')[0];
        }

        public static string Primero(Usuario usuario)
        {
            if (usuario == null) return "Cliente";
            return PrimeraPalabra(usuario.Nombres);
        }

        public static string Corto(Usuario usuario)
        {
            if (usuario == null) return "Cliente";
            return (PrimeraPalabra(usuario.Nombres) + " " + PrimeraPalabra(usuario.Apellidos)).Trim();
        }

        public static string Tienda(Usuario vendedor)
        {
            if (vendedor == null) return "Emprendedor";
            if (vendedor.Compania != null) return vendedor.Compania.Nombre;
            return Corto(vendedor);
        }
    }
}
