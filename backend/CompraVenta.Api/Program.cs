using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// la conexion a la base (con su clave) va en el archivo .env, que no se sube a GitHub
var archivoEnv = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(archivoEnv))
{
    foreach (var linea in File.ReadAllLines(archivoEnv))
    {
        var texto = linea.Trim();
        if (texto == "" || texto.StartsWith("#") || !texto.Contains('=')) continue;
        var nombre = texto.Substring(0, texto.IndexOf('=')).Trim();
        var valor = texto.Substring(texto.IndexOf('=') + 1).Trim();
        if (Environment.GetEnvironmentVariable(nombre) == null) Environment.SetEnvironmentVariable(nombre, valor);
    }
}

var builder = WebApplication.CreateBuilder(args);

// cuando el json viene malo se responde 400 con nuestro formato
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(opciones =>
    {
        opciones.SuppressMapClientErrors = true;
        opciones.InvalidModelStateResponseFactory = contexto =>
        {
            var errores = new List<string>();
            foreach (var campo in contexto.ModelState)
            {
                foreach (var error in campo.Value.Errors)
                {
                    var mensaje = error.ErrorMessage;
                    if (campo.Key == "" || campo.Key.StartsWith("$") || mensaje.StartsWith("The ") || mensaje.StartsWith("A non-empty"))
                        mensaje = "El cuerpo de la solicitud no es un JSON válido o algún campo tiene un tipo de dato incorrecto.";
                    if (!errores.Contains(mensaje)) errores.Add(mensaje);
                }
            }
            return new BadRequestObjectResult(RespuestaApi.Error("Datos inválidos.", errores));
        };
    });

// conexion a PostgreSQL (sale del .env, ConnectionStrings__Default)
var cadenaConexion = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(cadenaConexion))
    throw new InvalidOperationException("Falta la conexión a la base. Copia .env.example como .env y completa ConnectionStrings__Default.");
// secreto con el que se firman los tokens de sesion (Auth__Secreto en el .env)
Tokens.Configurar(builder.Configuration["Auth:Secreto"]);
builder.Services.AddDbContext<AppDbContext>(opciones => opciones.UseNpgsql(cadenaConexion));

var origenes = builder.Configuration.GetSection("Cors:Origenes").Get<string[]>() ?? new string[0];
builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy("Frontend", politica => politica.WithOrigins(origenes).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// cualquier error no controlado responde 500 sin mostrar detalles
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    await ctx.Response.WriteAsJsonAsync(RespuestaApi.Error("Error interno del servidor."));
}));

app.UseStatusCodePages(async contexto =>
{
    var codigo = contexto.HttpContext.Response.StatusCode;
    var mensaje = "No se pudo procesar la solicitud.";
    if (codigo == 404) mensaje = "La ruta solicitada no existe.";
    if (codigo == 405) mensaje = "Método HTTP no permitido para esta ruta.";
    if (codigo == 415) mensaje = "El cuerpo debe enviarse en formato JSON (Content-Type: application/json).";
    await contexto.HttpContext.Response.WriteAsJsonAsync(RespuestaApi.Error(mensaje));
});

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("Frontend");

// toda ruta de /api pide un token valido, menos las publicas que usa la pantalla de login y registro
app.Use(async (contexto, siguiente) =>
{
    var ruta = (contexto.Request.Path.Value ?? "").TrimEnd('/').ToLowerInvariant();
    var metodo = contexto.Request.Method.ToUpperInvariant();
    if (!ruta.StartsWith("/api") || metodo == "OPTIONS") { await siguiente(); return; }

    var publica = (metodo == "POST" && (ruta == "/api/login" || ruta == "/api/usuarios/registro"))
        || (metodo == "GET" && (ruta == "/api/usuarios" || ruta == "/api/companias" || ruta == "/api/categorias"));
    if (publica) { await siguiente(); return; }

    var cabecera = contexto.Request.Headers.Authorization.ToString();
    var token = cabecera.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? cabecera.Substring(7).Trim() : "";
    if (!Tokens.TryLeer(token, out var usuarioId, out var roles))
    {
        contexto.Response.StatusCode = 401;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("Sesión no válida o vencida. Vuelve a iniciar sesión."));
        return;
    }

    // solo el administrador puede usar estas rutas
    var soloAdmin = ruta == "/api/reportes/plataforma"
        || (metodo == "PUT" && ruta.EndsWith("/clave/restablecer"))
        || (metodo == "POST" && ruta == "/api/usuarios")
        || (metodo == "DELETE" && ruta.StartsWith("/api/usuarios/"))
        || (metodo != "GET" && (ruta == "/api/companias" || ruta.StartsWith("/api/companias/")
                              || ruta == "/api/categorias" || ruta.StartsWith("/api/categorias/")));
    if (soloAdmin && !roles.Contains("Admin"))
    {
        contexto.Response.StatusCode = 403;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("No tienes permiso para realizar esta acción."));
        return;
    }

    contexto.Items["usuarioId"] = usuarioId;
    await siguiente();
});

app.MapControllers();
app.MapFallbackToFile("{*ruta:regex(^(?!api/).*$):nonfile}", "index.html");

app.Run();
