using CompraVenta.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Utilidades
{
    // cada correo puede pertenecer a una sola persona, sea el principal o uno adicional
    public static class Correos
    {
        public static async Task<bool> EstaOcupado(AppDbContext context, string correo, int usuarioIgnorado = 0)
        {
            return await context.Usuarios.AnyAsync(u => u.Correo == correo && u.Id != usuarioIgnorado)
                || await context.CorreosAdicionales.AnyAsync(c => c.Correo == correo && c.UsuarioId != usuarioIgnorado);
        }

        public static async Task<List<string>> Ocupados(AppDbContext context, List<string> correos)
        {
            var principales = await context.Usuarios.Where(u => correos.Contains(u.Correo)).Select(u => u.Correo).ToListAsync();
            var adicionales = await context.CorreosAdicionales.Where(c => correos.Contains(c.Correo)).Select(c => c.Correo).ToListAsync();
            return principales.Concat(adicionales).Distinct().ToList();
        }
    }
}
