using CompraVenta.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CompraVenta.Api.Utilidades
{
    // datos de la persona que hizo la solicitud (los deja el middleware de Program.cs despues de revisar el token)
    public static class Sesion
    {
        public const string SinPermisoTexto = "No puedes ver ni cambiar datos de otra persona.";

        public static int UsuarioActual(this ControllerBase controlador)
        {
            return controlador.HttpContext.Items.TryGetValue("usuarioId", out var valor) && valor is int id ? id : 0;
        }

        public static bool EsAdmin(this ControllerBase controlador)
        {
            return controlador.HttpContext.Items.TryGetValue("roles", out var valor) && valor is string[] roles && roles.Contains("Admin");
        }

        // el dueño del dato o el administrador
        public static bool Puede(this ControllerBase controlador, int duenoId)
        {
            return controlador.EsAdmin() || controlador.UsuarioActual() == duenoId;
        }

        public static ObjectResult SinPermiso(this ControllerBase controlador, string mensaje = SinPermisoTexto)
        {
            return controlador.StatusCode(403, RespuestaApi.Error(mensaje));
        }
    }
}
