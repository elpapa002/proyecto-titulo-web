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

        private IQueryable<Producto> ConsultaProductos()
        {
            return _context.Productos
                .Include(p => p.Vendedor).ThenInclude(u => u.Compania)
                .Include(p => p.Ofertas);
        }

        [HttpGet]
        public async Task<IActionResult> GetProductos()
        {
            var productos = await ConsultaProductos()
                .Where(p => p.Estado == "Publicada")
                .OrderBy(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones obtenidas.", productos.Select(Mapeo.DeProducto).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProducto(int id)
        {
            var producto = await ConsultaProductos().FirstOrDefaultAsync(p => p.Id == id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));
            return Ok(RespuestaApi.Exito("Publicación encontrada.", Mapeo.DeProducto(producto)));
        }

        [HttpGet("{id}/relacionados")]
        public async Task<IActionResult> GetRelacionados(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));

            var relacionados = await ConsultaProductos()
                .Where(p => p.Id != id && p.Estado == "Publicada")
                .Where(p => p.SubcategoriaId == producto.SubcategoriaId || p.VendedorId == producto.VendedorId)
                .OrderBy(p => p.Id)
                .Take(5)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones relacionadas obtenidas.", relacionados.Select(Mapeo.DeProducto).ToList()));
        }

        [HttpGet("/api/vendedores/{vendedorId}/productos")]
        public async Task<IActionResult> GetProductosVendedor(int vendedorId)
        {
            if (await _context.Usuarios.FindAsync(vendedorId) is null)
                return NotFound(RespuestaApi.Error("Vendedor no encontrado."));

            var productos = await ConsultaProductos()
                .Where(p => p.VendedorId == vendedorId)
                .OrderBy(p => p.Id)
                .ToListAsync();
            return Ok(RespuestaApi.Exito("Publicaciones del vendedor obtenidas.", productos.Select(Mapeo.DeProducto).ToList()));
        }

        [HttpPost]
        public async Task<IActionResult> CrearProducto(ProductoCrearDto datos)
        {
            var problema = await ValidarProducto(datos);
            if (problema != null) return problema;

            var vendedor = await _context.Usuarios.FindAsync(datos.VendedorId);
            if (vendedor is null) return NotFound(RespuestaApi.Error("El vendedor no existe."));
            if (!vendedor.EsVendedor) return Conflict(RespuestaApi.Error("El usuario no tiene el rol Vendedor."));

            var sku = SkuDe(datos);
            if (sku != "" && await _context.Productos.AnyAsync(p => p.VendedorId == datos.VendedorId && p.Sku == sku))
                return Conflict(RespuestaApi.Error("Ya tienes una publicación con este SKU.", new List<string> { "sku: ya existe en tus publicaciones." }));

            var producto = new Producto { VendedorId = datos.VendedorId, Calificacion = 0, Resenas = 0 };
            CopiarDatos(producto, datos);
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            var creado = await ConsultaProductos().FirstAsync(p => p.Id == producto.Id);
            return Created($"/api/productos/{producto.Id}", RespuestaApi.Exito("Publicación creada.", Mapeo.DeProducto(creado)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, ProductoCrearDto datos)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));

            var problema = await ValidarProducto(datos);
            if (problema != null) return problema;

            var sku = SkuDe(datos);
            if (sku != "" && await _context.Productos.AnyAsync(p => p.VendedorId == producto.VendedorId && p.Sku == sku && p.Id != id))
                return Conflict(RespuestaApi.Error("Ya tienes una publicación con este SKU.", new List<string> { "sku: ya existe en tus publicaciones." }));

            CopiarDatos(producto, datos);
            await _context.SaveChangesAsync();

            var actualizado = await ConsultaProductos().FirstAsync(p => p.Id == id);
            return Ok(RespuestaApi.Exito("Publicación actualizada.", Mapeo.DeProducto(actualizado)));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto is null) return NotFound(RespuestaApi.Error("No existe la publicación."));

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
            return NoContent();
        }

        private async Task<IActionResult> ValidarProducto(ProductoCrearDto datos)
        {
            var errores = new List<string>();
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
        }
    }
}
