using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/login")]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        public LoginController(AppDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> IniciarSesion(LoginDto datos)
        {
            if (!Rut.EsValido(datos.Run))
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "El RUN no es válido. Revisa el dígito verificador." }));

            var run = Rut.Formatear(datos.Run);
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Run == run);
            // se compara la clave con el hash guardado
            if (usuario is null || !BCrypt.Net.BCrypt.Verify(datos.Clave, usuario.ClaveHash))
                return Unauthorized(RespuestaApi.Error("RUN o clave incorrectos."));

            var usuarioDto = Mapeo.DeUsuario(usuario);
            var respuesta = new LoginRespuestaDto
            {
                Usuario = usuarioDto,
                // token firmado: el backend lo revisa en cada llamada a /api (ver Program.cs)
                Token = Tokens.Crear(usuario.Id, usuarioDto.Roles)
            };
            return Ok(RespuestaApi.Exito("Sesión iniciada.", respuesta));
        }
    }
}
