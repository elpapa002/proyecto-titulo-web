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
// porcentaje con que se reajusta cada semana una cotizacion expirada
ReglasCotizacion.Configurar(builder.Configuration.GetValue<decimal?>("Cotizaciones:ReajusteSemanal"));
builder.Services.AddDbContext<AppDbContext>(opciones => opciones.UseNpgsql(cadenaConexion));

// paginas que pueden llamar a la API desde otra direccion (el frontend con npm run dev); se agregan mas en el .env con Cors__Origenes__N
var origenes = builder.Configuration.GetSection("Cors:Origenes").Get<string[]>() ?? new string[0];
if (origenes.Length == 0) origenes = new[] { "http://localhost:5173", "http://127.0.0.1:5173" };
builder.Services.AddCors(opciones =>
{
    // ademas de las del .env, se acepta el frontend abierto desde este computador o desde la red local
    // (por ejemplo http://192.168.100.20:5173), asi funciona aunque cambie la IP del computador
    opciones.AddPolicy("Frontend", politica => politica
        .SetIsOriginAllowed(origen => origenes.Contains(origen) || Red.EsLocal(origen))
        .AllowAnyHeader().AllowAnyMethod().WithExposedHeaders("WWW-Authenticate"));
});

var app = builder.Build();

// "dotnet run -- migrar" crea las tablas en una base vacia con las migraciones de la carpeta Migrations
// (en la Raspberry la base se crea con los scripts de database/, que dejan las mismas tablas y ademas cargan los datos de prueba)
if (args.Contains("migrar"))
{
    using var alcance = app.Services.CreateScope();
    var baseDatos = alcance.ServiceProvider.GetRequiredService<AppDbContext>();
    baseDatos.Database.Migrate();
    Console.WriteLine("Migraciones aplicadas: " + string.Join(", ", baseDatos.Database.GetAppliedMigrations()));
    return;
}

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

    var publica = (metodo == "POST" && (ruta == "/api/login" || ruta == "/api/usuarios/registro" || ruta == "/api/usuarios/disponibilidad"))
        || (metodo == "GET" && (ruta == "/api" || ruta == "/api/categorias" || ruta.StartsWith("/api/fotos/")));
    if (publica) { await siguiente(); return; }

    var cabecera = contexto.Request.Headers.Authorization.ToString();
    var token = cabecera.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? cabecera.Substring(7).Trim() : "";
    if (!Tokens.TryLeer(token, out var usuarioId, out var roles))
    {
        // con esta cabecera el frontend sabe que tiene que volver al login
        contexto.Response.Headers["WWW-Authenticate"] = "Bearer";
        contexto.Response.StatusCode = 401;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("Sesión no válida o vencida. Vuelve a iniciar sesión."));
        return;
    }

    var esAdmin = roles.Contains("Admin");

    // solo el administrador puede usar estas rutas
    var soloAdmin = ruta == "/api/reportes/plataforma"
        || (metodo == "GET" && ruta == "/api/usuarios")
        || (metodo == "PUT" && ruta.EndsWith("/clave/restablecer"))
        || (metodo == "POST" && ruta == "/api/usuarios")
        || (metodo == "DELETE" && ruta.StartsWith("/api/usuarios/"))
        || (metodo != "GET" && (ruta == "/api/companias" || ruta.StartsWith("/api/companias/")))
        || ((metodo == "PUT" || metodo == "DELETE") && ruta.StartsWith("/api/categorias/"));
    if (soloAdmin && !esAdmin)
    {
        contexto.Response.StatusCode = 403;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("No tienes permiso para realizar esta acción."));
        return;
    }

    // crear categorias lo pueden hacer el administrador y los emprendedores (cuando falta una para su producto)
    if (metodo == "POST" && ruta == "/api/categorias" && !esAdmin && !roles.Contains("Vendedor"))
    {
        contexto.Response.StatusCode = 403;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("Solo los emprendedores y el administrador pueden crear categorías."));
        return;
    }

    // cada persona solo ve o cambia sus propios datos (el administrador puede todo)
    if (!esAdmin && !Permisos.EsDelUsuario(ruta, metodo, usuarioId))
    {
        contexto.Response.StatusCode = 403;
        await contexto.Response.WriteAsJsonAsync(RespuestaApi.Error("No puedes ver ni cambiar datos de otra persona."));
        return;
    }

    // los controladores revisan con esto que el registro (producto, venta, oferta...) sea de quien llama
    contexto.Items["usuarioId"] = usuarioId;
    contexto.Items["roles"] = roles;
    await siguiente();
});

// mensaje de bienvenida para revisar desde Postman que la API esta funcionando
var bienvenida = RespuestaApi.Exito("API de Compra y Venta", new
{
    instrucciones = "Primero inicia sesión con POST /api/login y usa el token como Bearer. Ejemplo: GET http://localhost:5000/api/categorias"
});
app.MapGet("/api", () => Results.Ok(bienvenida));
// si no esta compilada la pagina en wwwroot, la raiz muestra el mismo mensaje
app.MapGet("/", () => Results.Ok(bienvenida));

app.MapControllers();
app.MapFallbackToFile("{*ruta:regex(^(?!api/).*$):nonfile}", "index.html");

app.Run();
