using System.Text.RegularExpressions;
using CompraVenta.Api.Data;
using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;
using CompraVenta.Api.Utilidades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Controllers
{
    [ApiController]
    [Route("api/productos")]
    public class ProductosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProductosController(AppDbContext context) => _context = context;

        private const int MaximoVariantes = 30;
        private const int MaximoRelacionados = 6;

        private IQueryable<Producto> ConsultaProductos()
        {
            return _context.Productos
                .Include(p => p.Vendedor).ThenInclude(u => u.Compania)
                .Include(p => p.Ofertas)
                .Include(p => p.Variantes)
                .Include(p => p.Relacionados);
        }

        // ids de las fotos de cada producto, sin traer los bytes de las imagenes
        private async Task<List<ProductoDto>> ADtos(List<Producto> productos)
        {
            var ids = productos.Select(p => p.Id).ToList();
            var fotos = await _context.Fotos
                .Where(f => ids.Contains(f.ProductoId))
                .OrderBy(f => f.Orden).ThenBy(f => f.Id)
                .Select(f => new { f.Id, f.ProductoId })
                .ToListAsync();
            foreach (var producto in productos)
            {
                producto.FotoIds = fotos.Where(f => f.ProductoId == producto.Id).Select(f => f.Id).ToList();
            }
            return productos.Select(Mapeo.DeProducto).ToList();
        }

        private async Task<ProductoDto> ADto(Producto producto)
        {
            return (await ADtos(new List<Producto> { producto }))[0];
        }

        [HttpGet]
        public async Task<IActionResult> GetProductos()
        {
            var productos = await ConsultaProductos()
                .Where(p => p.Estado == "Publicada")
                .OrderBy(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones obtenidas.", await ADtos(productos)));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProducto(int id)
        {
            var producto = await ConsultaProductos().FirstOrDefaultAsync(p => p.Id == id);
            // un borrador o una publicacion pausada solo la ve su dueño
            if (producto is null || (producto.Estado != "Publicada" && !this.Puede(producto.VendedorId)))
                return NotFound(RespuestaApi.Error("No existe la publicación."));
            return Ok(RespuestaApi.Exito("Publicación encontrada.", await ADto(producto)));
        }

        [HttpGet("{id}/relacionados")]
        public async Task<IActionResult> GetRelacionados(int id)
        {
            var producto = await _context.Productos.Include(p => p.Relacionados).FirstOrDefaultAsync(p => p.Id == id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));

            // primero los que eligio el emprendedor y despues se completa con la misma subcategoria o tienda
            var elegidos = producto.Relacionados.OrderBy(r => r.Id).Select(r => r.RelacionadoId).ToList();
            var primeros = await ConsultaProductos()
                .Where(p => elegidos.Contains(p.Id) && p.Estado == "Publicada")
                .ToListAsync();
            primeros = primeros.OrderBy(p => elegidos.IndexOf(p.Id)).ToList();

            var resto = await ConsultaProductos()
                .Where(p => p.Id != id && p.Estado == "Publicada" && !elegidos.Contains(p.Id))
                .Where(p => p.SubcategoriaId == producto.SubcategoriaId || p.VendedorId == producto.VendedorId)
                .OrderBy(p => p.Id)
                .Take(Math.Max(0, 5 - primeros.Count))
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones relacionadas obtenidas.", await ADtos(primeros.Concat(resto).ToList())));
        }

        [HttpGet("/api/vendedores/{vendedorId}/productos")]
        public async Task<IActionResult> GetProductosVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            // los demas usuarios solo ven lo publicado; el emprendedor ve tambien sus borradores y pausadas
            var todas = this.Puede(vendedorId);
            var productos = await ConsultaProductos()
                .Where(p => p.VendedorId == vendedorId && (todas || p.Estado == "Publicada"))
                .OrderBy(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones del vendedor obtenidas.", await ADtos(productos)));
        }

        [HttpPost]
        public async Task<IActionResult> CrearProducto(ProductoCrearDto datos)
        {
            if (!this.Puede(datos.VendedorId)) return this.SinPermiso("Solo puedes publicar a tu nombre.");
            var problema = await ValidarProducto(datos, datos.VendedorId, 0);
            if (problema != null) return problema;
            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var sku = SkuDe(datos);
            if (sku != "" && await _context.Productos.AnyAsync(p => p.VendedorId == datos.VendedorId && p.Sku == sku))
                return Conflict(RespuestaApi.Error("Ya tienes una publicación con este SKU.", new List<string> { "sku: ya existe en tus publicaciones." }));

            var producto = new Producto { VendedorId = datos.VendedorId, Calificacion = 0, Resenas = 0 };
            CopiarDatos(producto, datos);
            using var transaccion = await _context.Database.BeginTransactionAsync();
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            GuardarVariantes(producto, datos);
            GuardarRelacionados(producto, datos);
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            var creado = await ConsultaProductos().FirstAsync(p => p.Id == producto.Id);
            return Created($"/api/productos/{producto.Id}", RespuestaApi.Exito("Publicación creada.", await ADto(creado)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, ProductoCrearDto datos)
        {
            var producto = await _context.Productos
                .Include(p => p.Variantes)
                .Include(p => p.Relacionados)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));
            if (!this.Puede(producto.VendedorId)) return this.SinPermiso("Solo puedes cambiar tus propias publicaciones.");

            var problema = await ValidarProducto(datos, producto.VendedorId, id);
            if (problema != null) return problema;
            var ajenas = (datos.Variantes ?? new List<VarianteCrearDto>())
                .Where(v => v.Id != null && !producto.Variantes.Any(e => e.Id == v.Id)).ToList();
            if (ajenas.Count > 0) return NotFound(RespuestaApi.Error($"La variante {ajenas[0].Id} no es de esta publicación."));

            var sku = SkuDe(datos);
            if (sku != "" && await _context.Productos.AnyAsync(p => p.VendedorId == producto.VendedorId && p.Sku == sku && p.Id != id))
                return Conflict(RespuestaApi.Error("Ya tienes una publicación con este SKU.", new List<string> { "sku: ya existe en tus publicaciones." }));

            CopiarDatos(producto, datos);
            GuardarVariantes(producto, datos);
            GuardarRelacionados(producto, datos);
            await _context.SaveChangesAsync();

            var actualizado = await ConsultaProductos().FirstAsync(p => p.Id == id);
            return Ok(RespuestaApi.Exito("Publicación actualizada.", await ADto(actualizado)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));
            if (!this.Puede(producto.VendedorId)) return this.SinPermiso("Solo puedes eliminar tus propias publicaciones.");

            if (await _context.DetallesVenta.AnyAsync(d => d.ProductoId == id))
                return Conflict(RespuestaApi.Error("La publicación tiene ventas registradas y no se puede eliminar. Puedes pausarla."));

            var ofertas = await _context.Ofertas.Where(o => o.ProductoId == id).ToListAsync();
            _context.Ofertas.RemoveRange(ofertas);

            var preguntas = await _context.Preguntas.Where(p => p.ProductoId == id).ToListAsync();
            _context.Preguntas.RemoveRange(preguntas);

            var detallesCotizacion = await _context.DetallesCotizacion.Where(d => d.ProductoId == id).ToListAsync();
            foreach (var detalle in detallesCotizacion)
            {
                detalle.ProductoId = null;
            }

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
            return Ok(RespuestaApi.Exito("Publicación eliminada correctamente.", null));
        }

        private async Task<IActionResult> ValidarProducto(ProductoCrearDto datos, int vendedorId, int idActual)
        {
            var errores = new List<string>();
            var variantes = datos.Variantes ?? new List<VarianteCrearDto>();
            if (datos.Tipo == "Servicio" && variantes.Count > 0) errores.Add("Un servicio no puede tener variantes de talla o color.");
            if (variantes.Count > MaximoVariantes) errores.Add($"Puedes agregar como máximo {MaximoVariantes} variantes.");
            foreach (var variante in variantes)
            {
                var texto = $"{(variante.Talla ?? "").Trim()} {(variante.Color ?? "").Trim()}".Trim();
                if (texto == "") errores.Add("Cada variante necesita una talla, un color o ambos.");
                if (!Regex.IsMatch((variante.Sku ?? "").Trim(), "^[A-Z0-9-]{3,20}$"))
                    errores.Add($"El SKU de la variante {texto} debe tener al menos 3 caracteres y solo mayúsculas, números o guion.");
            }
            var combinaciones = variantes.Select(v => $"{(v.Talla ?? "").Trim().ToLower()}|{(v.Color ?? "").Trim().ToLower()}").ToList();
            if (combinaciones.Distinct().Count() != combinaciones.Count) errores.Add("Hay variantes repetidas (misma talla y color).");
            var skus = variantes.Select(v => (v.Sku ?? "").Trim()).Where(s => s != "").ToList();
            if (skus.Distinct().Count() != skus.Count || skus.Contains(SkuDe(datos))) errores.Add("Cada variante debe tener un SKU distinto.");

            var relacionados = datos.Relacionados ?? new List<int>();
            if (relacionados.Count > MaximoRelacionados) errores.Add($"Puedes elegir como máximo {MaximoRelacionados} productos relacionados.");
            if (relacionados.Contains(idActual)) errores.Add("Una publicación no puede estar relacionada consigo misma.");
            if (errores.Count == 0 && relacionados.Count > 0)
            {
                var propios = await _context.Productos.CountAsync(p => relacionados.Contains(p.Id) && p.VendedorId == vendedorId);
                if (propios != relacionados.Distinct().Count()) errores.Add("Los productos relacionados deben ser publicaciones tuyas.");
            }

            // el SKU de una variante no puede repetirse en otras publicaciones del mismo emprendedor
            if (errores.Count == 0 && skus.Count > 0)
            {
                var usados = await _context.Variantes
                    .Where(v => skus.Contains(v.Sku) && v.ProductoId != idActual)
                    .Join(_context.Productos.Where(p => p.VendedorId == vendedorId), v => v.ProductoId, p => p.Id, (v, p) => v.Sku)
                    .ToListAsync();
                usados.AddRange(await _context.Productos.Where(p => p.VendedorId == vendedorId && p.Id != idActual && skus.Contains(p.Sku)).Select(p => p.Sku).ToListAsync());
                if (usados.Count > 0)
                    return Conflict(RespuestaApi.Error("Ya tienes una publicación con este SKU.", new List<string> { $"sku: {usados[0]} ya existe en tus publicaciones." }));
            }
            if (datos.Tipo == "Producto")
            {
                if (string.IsNullOrWhiteSpace(datos.Material)) errores.Add("El material es obligatorio.");
                if (string.IsNullOrWhiteSpace(datos.Peso)) errores.Add("El peso es obligatorio.");
                if (string.IsNullOrWhiteSpace(datos.Tamano)) errores.Add("El tamaño es obligatorio.");
                if (string.IsNullOrWhiteSpace(datos.Color)) errores.Add("El color es obligatorio.");
                var sku = datos.Sku ?? "";
                if (sku.Length < 3 || !Regex.IsMatch(sku, "^[A-Z0-9-]+$"))
                    errores.Add("El SKU debe tener al menos 3 caracteres y solo mayúsculas, números o guion.");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(datos.Duracion)) errores.Add("La duración del servicio es obligatoria.");
            }
            if (errores.Count > 0) return BadRequest(RespuestaApi.Error("Datos inválidos.", errores));

            var subcategoria = await _context.Categorias.FindAsync(datos.SubcategoriaId);
            if (subcategoria is null) return NotFound(RespuestaApi.Error("La subcategoría no existe."));
            if (subcategoria.PadreId != datos.CategoriaId)
                return BadRequest(RespuestaApi.Error("Datos inválidos.", new List<string> { "La subcategoría no pertenece a la categoría elegida." }));
            return null;
        }

        private static string SkuDe(ProductoCrearDto datos)
        {
            return datos.Tipo == "Servicio" ? "" : (datos.Sku ?? "").Trim();
        }

        // agrega, cambia o quita variantes segun lo que llega del formulario; el stock del producto es la suma
        private void GuardarVariantes(Producto producto, ProductoCrearDto datos)
        {
            if (datos.Variantes == null) return;
            var quitadas = producto.Variantes.Where(e => !datos.Variantes.Any(v => v.Id == e.Id)).ToList();
            _context.Variantes.RemoveRange(quitadas);
            foreach (var quitada in quitadas) producto.Variantes.Remove(quitada);

            foreach (var datosVariante in datos.Variantes)
            {
                var variante = producto.Variantes.FirstOrDefault(v => datosVariante.Id != null && v.Id == datosVariante.Id);
                if (variante == null)
                {
                    variante = new Variante { ProductoId = producto.Id };
                    producto.Variantes.Add(variante);
                }
                variante.Talla = (datosVariante.Talla ?? "").Trim();
                variante.Color = (datosVariante.Color ?? "").Trim();
                variante.Sku = datosVariante.Sku.Trim();
                variante.Stock = datosVariante.Stock;
                variante.Precio = datosVariante.Precio;
            }
            if (producto.Variantes.Count > 0) producto.Stock = producto.Variantes.Sum(v => v.Stock);
        }

        private void GuardarRelacionados(Producto producto, ProductoCrearDto datos)
        {
            if (datos.Relacionados == null) return;
            var elegidos = datos.Relacionados.Distinct().ToList();
            var quitados = producto.Relacionados.Where(r => !elegidos.Contains(r.RelacionadoId)).ToList();
            _context.ProductosRelacionados.RemoveRange(quitados);
            foreach (var id in elegidos.Where(id => !producto.Relacionados.Any(r => r.RelacionadoId == id)))
            {
                producto.Relacionados.Add(new ProductoRelacionado { ProductoId = producto.Id, RelacionadoId = id });
            }
        }

        private static void CopiarDatos(Producto producto, ProductoCrearDto datos)
        {
            var esServicio = datos.Tipo == "Servicio";
            producto.Tipo = datos.Tipo;
            producto.Nombre = datos.Nombre.Trim();
            producto.Sku = SkuDe(datos);
            producto.CategoriaId = datos.CategoriaId;
            producto.SubcategoriaId = datos.SubcategoriaId;
            producto.Descripcion = datos.Descripcion.Trim();
            producto.Material = esServicio ? "" : datos.Material.Trim();
            producto.Peso = esServicio ? "" : datos.Peso.Trim();
            producto.Tamano = esServicio ? "" : datos.Tamano.Trim();
            producto.Color = esServicio ? "" : datos.Color.Trim();
            producto.Duracion = esServicio ? datos.Duracion.Trim() : "";
            producto.EdadMinima = datos.EdadMinima;
            producto.Precio = datos.Precio;
            producto.Stock = datos.Stock;
            producto.Estado = datos.Estado;
            producto.TextoAlternativo = (datos.TextoAlternativo ?? "").Trim();
        }
    }
}
