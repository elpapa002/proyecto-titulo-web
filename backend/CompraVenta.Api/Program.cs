using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

// conexion a PostgreSQL (la clave real va en appsettings.Development.json)
var cadenaConexion = builder.Configuration.GetConnectionString("Default");
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

app.UseCors("Frontend");
app.MapControllers();

app.Run();
