using CompraVenta.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CompraVenta.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Compania> Companias => Set<Compania>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Direccion> Direcciones => Set<Direccion>();
        public DbSet<Telefono> Telefonos => Set<Telefono>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<Producto> Productos => Set<Producto>();
        public DbSet<Oferta> Ofertas => Set<Oferta>();
        public DbSet<CostoEnvio> CostosEnvio => Set<CostoEnvio>();
        public DbSet<Venta> Ventas => Set<Venta>();
        public DbSet<DetalleVenta> DetallesVenta => Set<DetalleVenta>();
        public DbSet<Pregunta> Preguntas => Set<Pregunta>();
        public DbSet<Cotizacion> Cotizaciones => Set<Cotizacion>();
        public DbSet<DetalleCotizacion> DetallesCotizacion => Set<DetalleCotizacion>();
        public DbSet<Calificacion> Calificaciones => Set<Calificacion>();
        public DbSet<Devolucion> Devoluciones => Set<Devolucion>();
        public DbSet<Mensaje> Mensajes => Set<Mensaje>();
        public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
    }
}
