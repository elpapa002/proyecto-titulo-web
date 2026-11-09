using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuariosController : ControllerBase
    {
        private static readonly List<string> RolesValidos = new List<string> { "Cliente", "Vendedor", "Admin" };

        private readonly AppDbContext _context;
        public UsuariosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios.OrderBy(u => u.Id).ToListAsync();
            return Ok(RespuestaApi.Exito("Usuarios obtenidos.", usuarios.Select(Mapeo.DeUsuario).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound(RespuestaApi.Error("Usuario no encontrado."));
            return Ok(RespuestaApi.Exito("Usuario encontrado.", Mapeo.DeUsuario(usuario)));
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registrar(RegistroDto datos)
        {
            var errores = new List<string>();
            if (!Rut.EsValido(datos.Run)) errores.Add("El RUN no es válido. Revisa el dígito verificador.");

            DateOnly nacimiento;
            if (!Validaciones.LeerFecha(datos.FechaNacimiento, out nacimiento))
                errores.Add("La fecha de nacimiento debe tener el formato AAAA-MM-DD.");
            else if (nacimiento.Year < 1900 || nacimiento > Validaciones.Hoy())
                errores.Add("La fecha de nacimiento debe ser desde 1900 y no puede ser futura.");

            if (datos.Roles.Any(r => r != "Cliente" && r != "Vendedor"))
                errores.Add("Al registrarte solo puedes elegir los roles Cliente o Vendedor.");

            var correos = datos.Correos.Where(c => !string.IsNullOrWhiteSpace(c)).Select(c => c.Trim().ToLower()).ToList();
            if (correos.Count == 0) errores.Add("Debe ingresar al menos un correo.");
            else if (correos.Any(c => !Validaciones.EsCorreo(c) || c.Length > 120)) errores.Add("Algún correo no tiene un formato válido.");

            var telefonos = (datos.Telefonos ?? new List<string>()).Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()).ToList();
            if (telefonos.Any(t => Validaciones.SoloDigitos(t).Length < 8 || t.Length > 20))
                errores.Add("Algún teléfono no es válido, debe tener al menos 8 dígitos.");
            if (telefonos.Select(Validaciones.SoloDigitos).Distinct().Count() != telefonos.Count)
                errores.Add("Hay teléfonos repetidos.");

            if (datos.Empresa != null)
            {
                if (!Rut.EsValido(datos.Empresa.Rut)) errores.Add("El RUT de la empresa no es válido. Revisa el dígito verificador.");
                if (Validaciones.SoloDigitos(datos.Empresa.Telefono).Length < 8) errores.Add("El teléfono de la empresa no es válido.");
                if (!datos.Roles.Contains("Vendedor")) errores.Add("Para registrar una empresa la cuenta debe tener el rol Vendedor.");
            }

            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var run = Rut.Formatear(datos.Run);
            if (await _context.Usuarios.AnyAsync(u => u.Run == run))
                return Conflict(RespuestaApi.Error("El RUN ya está registrado.", new List<string> { "run: ya existe un usuario con ese RUN." }));

            var correo = correos[0];
            if (await _context.Usuarios.AnyAsync(u => u.Correo == correo))
                return Conflict(RespuestaApi.Error("El correo ya está registrado.", new List<string> { "correo: ya existe un usuario con ese correo." }));

            var numerosExistentes = await _context.Telefonos.Select(t => t.Numero).ToListAsync();
            var digitosExistentes = numerosExistentes.Select(Validaciones.SoloDigitos).ToList();
            if (telefonos.Any(t => digitosExistentes.Contains(Validaciones.SoloDigitos(t))))
                return Conflict(RespuestaApi.Error("Ese teléfono ya pertenece a otra persona.", new List<string> { "telefono: ya está registrado." }));

            string rutEmpresa = null;
            if (datos.Empresa != null)
            {
                rutEmpresa = Rut.Formatear(datos.Empresa.Rut);
                if (await _context.Companias.AnyAsync(c => c.Rut == rutEmpresa))
                    return Conflict(RespuestaApi.Error("Esta empresa ya está registrada.", new List<string> { "rut: ya existe una compañía con ese RUT." }));
            }

            using var transaccion = await _context.Database.BeginTransactionAsync();

            int? companiaId = null;
            if (datos.Empresa != null)
            {
                var compania = new Compania
                {
                    Rut = rutEmpresa,
                    Nombre = datos.Empresa.Nombre.Trim(),
                    Personas = datos.Empresa.Personas,
                    Telefono = datos.Empresa.Telefono.Trim(),
                    Correo = datos.Empresa.Correo.Trim().ToLower(),
                    SitioWeb = (datos.Empresa.SitioWeb ?? "").Trim(),
                    Direccion = (datos.Empresa.Direccion ?? "").Trim()
                };
                _context.Companias.Add(compania);
                await _context.SaveChangesAsync();
                companiaId = compania.Id;
            }

            var usuario = new Usuario
            {
                Run = run,
                Nombres = datos.Nombres.Trim(),
                Apellidos = datos.Apellidos.Trim(),
                Correo = correo,
                FechaNacimiento = nacimiento,
                FechaIngreso = Validaciones.Hoy(),
                // la clave se guarda solo como hash (bcrypt, 10 rondas)
                ClaveHash = BCrypt.Net.BCrypt.HashPassword(datos.Clave, 10),
                EsCliente = datos.Roles.Contains("Cliente"),
                EsVendedor = datos.Roles.Contains("Vendedor"),
                EsAdmin = false,
                CompaniaId = companiaId
            };
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            for (var i = 0; i < datos.Direcciones.Count; i++)
            {
                var direccion = datos.Direcciones[i];
                _context.Direcciones.Add(new Direccion
                {
                    UsuarioId = usuario.Id,
                    Calle = direccion.Calle.Trim(),
                    Numero = direccion.Numero.Trim(),
                    Comuna = direccion.Comuna.Trim(),
                    CodigoPostal = (direccion.CodigoPostal ?? "").Trim(),
                    Principal = i == 0
                });
            }

            foreach (var numero in telefonos)
            {
                _context.Telefonos.Add(new Telefono { UsuarioId = usuario.Id, Numero = numero });
            }

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            return Created($"/api/usuarios/{usuario.Id}", RespuestaApi.Exito("Cuenta creada.", Mapeo.DeUsuario(usuario)));
        }

        [HttpPost]
        public async Task<IActionResult> CrearUsuario(UsuarioCrearDto datos)
        {
            var errores = new List<string>();
            if (!Rut.EsValido(datos.Run)) errores.Add("El RUN no es válido. Revisa el dígito verificador.");
            if (datos.Roles.Any(r => !RolesValidos.Contains(r))) errores.Add("Los roles permitidos son Cliente, Vendedor y Admin.");
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var run = Rut.Formatear(datos.Run);
            if (await _context.Usuarios.AnyAsync(u => u.Run == run))
                return Conflict(RespuestaApi.Error("El RUN ya está registrado.", new List<string> { "run: ya existe un usuario con ese RUN." }));

            var correo = datos.Correo.Trim().ToLower();
            if (await _context.Usuarios.AnyAsync(u => u.Correo == correo))
                return Conflict(RespuestaApi.Error("El correo ya está registrado.", new List<string> { "correo: ya existe un usuario con ese correo." }));

            var esVendedor = datos.Roles.Contains("Vendedor");
            if (esVendedor && datos.CompaniaId != null && await _context.Companias.FindAsync(datos.CompaniaId.Value) is null)
                return NotFound(RespuestaApi.Error("La compañía no existe."));

            var usuario = new Usuario
            {
                Run = run,
                Nombres = datos.Nombres.Trim(),
                Apellidos = datos.Apellidos.Trim(),
                Correo = correo,
                FechaNacimiento = null,
                FechaIngreso = Validaciones.Hoy(),
                ClaveHash = BCrypt.Net.BCrypt.HashPassword(Rut.Limpiar(run), 10),
                EsCliente = datos.Roles.Contains("Cliente"),
                EsVendedor = esVendedor,
                EsAdmin = datos.Roles.Contains("Admin"),
                CompaniaId = esVendedor ? datos.CompaniaId : null
            };
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Created($"/api/usuarios/{usuario.Id}", RespuestaApi.Exito("Usuario creado. Su clave temporal es su RUN sin puntos ni guion.", Mapeo.DeUsuario(usuario)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(int id, UsuarioEditarDto datos)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            var errores = new List<string>();
            if (datos.Run != null && !Rut.EsValido(datos.Run)) errores.Add("El RUN no es válido. Revisa el dígito verificador.");

            DateOnly nacimiento = default;
            if (!string.IsNullOrEmpty(datos.FechaNacimiento))
            {
                if (!Validaciones.LeerFecha(datos.FechaNacimiento, out nacimiento))
                    errores.Add("La fecha de nacimiento debe tener el formato AAAA-MM-DD.");
                else if (nacimiento.Year < 1900 || nacimiento > Validaciones.Hoy())
                    errores.Add("La fecha de nacimiento debe ser desde 1900 y no puede ser futura.");
            }

            if (datos.Roles != null)
            {
                if (datos.Roles.Count == 0) errores.Add("Debe elegir al menos un rol.");
                else if (datos.Roles.Any(r => !RolesValidos.Contains(r))) errores.Add("Los roles permitidos son Cliente, Vendedor y Admin.");
            }

            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            if (datos.Run != null)
            {
                var run = Rut.Formatear(datos.Run);
                if (await _context.Usuarios.AnyAsync(u => u.Run == run && u.Id != id))
                    return Conflict(RespuestaApi.Error("El RUN ya está registrado.", new List<string> { "run: ya existe un usuario con ese RUN." }));
                usuario.Run = run;
            }

            if (datos.Correo != null)
            {
                var correo = datos.Correo.Trim().ToLower();
                if (await _context.Usuarios.AnyAsync(u => u.Correo == correo && u.Id != id))
                    return Conflict(RespuestaApi.Error("El correo ya está registrado.", new List<string> { "correo: ya existe un usuario con ese correo." }));
                usuario.Correo = correo;
            }

            if (datos.Nombres != null) usuario.Nombres = datos.Nombres.Trim();
            if (datos.Apellidos != null) usuario.Apellidos = datos.Apellidos.Trim();
            if (datos.FechaNacimiento != null) usuario.FechaNacimiento = datos.FechaNacimiento == "" ? null : nacimiento;

            if (datos.Roles != null)
            {
                if (usuario.EsAdmin && !datos.Roles.Contains("Admin") && await _context.Usuarios.CountAsync(u => u.EsAdmin) == 1)
                    return Conflict(RespuestaApi.Error("No se puede quitar el rol Admin al único administrador."));

                var esVendedor = datos.Roles.Contains("Vendedor");
                if (esVendedor && datos.CompaniaId != null && await _context.Companias.FindAsync(datos.CompaniaId.Value) is null)
                    return NotFound(RespuestaApi.Error("La compañía no existe."));

                usuario.EsCliente = datos.Roles.Contains("Cliente");
                usuario.EsVendedor = esVendedor;
                usuario.EsAdmin = datos.Roles.Contains("Admin");
                usuario.CompaniaId = esVendedor ? datos.CompaniaId : null;
            }

            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Usuario actualizado.", Mapeo.DeUsuario(usuario)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            if (usuario.EsAdmin && await _context.Usuarios.CountAsync(u => u.EsAdmin) == 1)
                return Conflict(RespuestaApi.Error("No se puede eliminar al único administrador."));

            var tienePublicaciones = await _context.Productos.AnyAsync(p => p.VendedorId == id);
            var tieneVentas = await _context.Ventas.AnyAsync(v => v.ClienteId == id || v.VendedorId == id);
            if (tienePublicaciones || tieneVentas)
                return Conflict(RespuestaApi.Error("No se puede eliminar el usuario porque tiene publicaciones o compras registradas."));

            _context.Usuarios.Remove(usuario);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(RespuestaApi.Error("No se puede eliminar el usuario porque tiene datos asociados."));
            }
            return NoContent();
        }

        [HttpPut("{id}/clave")]
        public async Task<IActionResult> CambiarClave(int id, CambioClaveDto datos)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound(RespuestaApi.Error("Usuario no encontrado."));

            if (datos.ClaveNueva == datos.ClaveActual)
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "La clave nueva debe ser distinta de la actual." }));

            if (!BCrypt.Net.BCrypt.Verify(datos.ClaveActual, usuario.ClaveHash))
                return Unauthorized(RespuestaApi.Error("La clave actual no es correcta."));

            usuario.ClaveHash = BCrypt.Net.BCrypt.HashPassword(datos.ClaveNueva, 10);
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Clave actualizada.", Mapeo.DeUsuario(usuario)));
        }
    }
}
