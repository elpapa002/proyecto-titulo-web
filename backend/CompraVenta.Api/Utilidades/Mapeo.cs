using CompraVenta.Api.DTOs;
using CompraVenta.Api.Models;

namespace CompraVenta.Api.Utilidades
{
    public static class Mapeo
    {
        public static UsuarioDto DeUsuario(Usuario usuario)
        {
            var roles = new List<string>();
            if (usuario.EsCliente) roles.Add("Cliente");
            if (usuario.EsVendedor) roles.Add("Vendedor");
            if (usuario.EsAdmin) roles.Add("Admin");

            return new UsuarioDto
            {
                Id = usuario.Id,
                Run = usuario.Run,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Correo = usuario.Correo,
                FechaNacimiento = Validaciones.Texto(usuario.FechaNacimiento),
                FechaIngreso = Validaciones.Texto(usuario.FechaIngreso),
                Roles = roles,
                CompaniaId = usuario.CompaniaId
            };
        }

        public static CompaniaDto DeCompania(Compania compania)
        {
            return new CompaniaDto
            {
                Id = compania.Id,
                Rut = compania.Rut,
                Nombre = compania.Nombre,
                Personas = compania.Personas,
                Telefono = compania.Telefono,
                Correo = compania.Correo,
                SitioWeb = compania.SitioWeb,
                Direccion = compania.Direccion
            };
        }

        public static CategoriaDto DeCategoria(Categoria categoria)
        {
            return new CategoriaDto
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Ruta = categoria.Ruta,
                PadreId = categoria.PadreId
            };
        }

        public static Oferta OfertaVigente(Producto producto)
        {
            var hoy = Validaciones.Hoy();
            return producto.Ofertas.FirstOrDefault(o => o.Inicio <= hoy && o.Fin >= hoy);
        }

        public static ProductoDto DeProducto(Producto producto)
        {
            var oferta = OfertaVigente(producto);
            return new ProductoDto
            {
                Id = producto.Id,
                VendedorId = producto.VendedorId,
                Tipo = producto.Tipo,
                Nombre = producto.Nombre,
                Sku = producto.Sku,
                CategoriaId = producto.CategoriaId,
                SubcategoriaId = producto.SubcategoriaId,
                Descripcion = producto.Descripcion,
                Material = producto.Material,
                Peso = producto.Peso,
                Tamano = producto.Tamano,
                Color = producto.Color,
                EdadMinima = producto.EdadMinima,
                Duracion = producto.Duracion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                Estado = producto.Estado,
                Calificacion = producto.Calificacion,
                Resenas = producto.Resenas,
                Tienda = Nombres.Tienda(producto.Vendedor),
                PrecioOferta = oferta == null ? null : oferta.PrecioOferta,
                FinOferta = oferta == null ? null : Validaciones.Texto(oferta.Fin)
            };
        }

        public static OfertaDto DeOferta(Oferta oferta)
        {
            return new OfertaDto
            {
                Id = oferta.Id,
                VendedorId = oferta.VendedorId,
                ProductoId = oferta.ProductoId,
                PrecioOferta = oferta.PrecioOferta,
                Inicio = Validaciones.Texto(oferta.Inicio),
                Fin = Validaciones.Texto(oferta.Fin),
                Difundir = oferta.Difundir,
                NombreProducto = oferta.Producto == null ? "" : oferta.Producto.Nombre,
                Precio = oferta.Producto == null ? 0 : oferta.Producto.Precio
            };
        }

        public static CostoEnvioDto DeCostoEnvio(CostoEnvio costo)
        {
            return new CostoEnvioDto
            {
                Id = costo.Id,
                VendedorId = costo.VendedorId,
                Comuna = costo.Comuna,
                Costo = costo.Costo,
                Dias = costo.Dias
            };
        }

        public static DireccionDto DeDireccion(Direccion direccion)
        {
            return new DireccionDto
            {
                Id = direccion.Id,
                UsuarioId = direccion.UsuarioId,
                Calle = direccion.Calle,
                Numero = direccion.Numero,
                Comuna = direccion.Comuna,
                CodigoPostal = direccion.CodigoPostal,
                Principal = direccion.Principal
            };
        }

        public static TelefonoDto DeTelefono(Telefono telefono)
        {
            return new TelefonoDto
            {
                Id = telefono.Id,
                UsuarioId = telefono.UsuarioId,
                Numero = telefono.Numero
            };
        }

        public static VentaDto DeVenta(Venta venta)
        {
            return new VentaDto
            {
                Id = venta.Id,
                ClienteId = venta.ClienteId,
                VendedorId = venta.VendedorId,
                Fecha = Validaciones.Texto(venta.Fecha),
                Items = venta.Detalles
                    .OrderBy(d => d.Id)
                    .Select(d => new ItemVentaDto { ProductoId = d.ProductoId, Nombre = d.Nombre, Cantidad = d.Cantidad, Precio = d.Precio })
                    .ToList(),
                Envio = venta.Envio,
                Total = venta.Total,
                MedioPago = new MedioPagoDto
                {
                    Tipo = venta.MedioTipo,
                    Marca = venta.MedioMarca,
                    Ultimos4 = venta.MedioUltimos4 == null ? "" : venta.MedioUltimos4.Trim()
                },
                EstadoTransaccion = venta.EstadoTransaccion,
                EstadoPedido = venta.EstadoPedido,
                Direccion = venta.Direccion,
                EmpresaTransporte = venta.EmpresaTransporte,
                Seguimiento = venta.Seguimiento,
                Calificada = venta.Calificada,
                Cliente = Nombres.Corto(venta.Cliente),
                Tienda = Nombres.Tienda(venta.Vendedor)
            };
        }

        public static PreguntaDto DePregunta(Pregunta pregunta)
        {
            return new PreguntaDto
            {
                Id = pregunta.Id,
                ProductoId = pregunta.ProductoId,
                ClienteId = pregunta.ClienteId,
                Texto = pregunta.Texto,
                Fecha = Validaciones.Texto(pregunta.Fecha),
                Respuesta = pregunta.Respuesta,
                FechaRespuesta = Validaciones.Texto(pregunta.FechaRespuesta),
                Cliente = Nombres.Primero(pregunta.Cliente),
                NombreProducto = pregunta.Producto == null ? "" : pregunta.Producto.Nombre
            };
        }

        public static string EstadoCotizacion(Cotizacion cotizacion)
        {
            if (cotizacion.Estado == "Respondida" && cotizacion.Vigencia != null && cotizacion.Vigencia < Validaciones.Hoy())
                return "Vencida";
            return cotizacion.Estado;
        }

        public static CotizacionDto DeCotizacion(Cotizacion cotizacion)
        {
            var detalles = cotizacion.Detalles.OrderBy(d => d.Id).ToList();
            RespuestaCotizacionDto respuesta = null;
            if (cotizacion.RespuestaFecha != null)
            {
                respuesta = new RespuestaCotizacionDto
                {
                    Precios = detalles
                        .Where(d => d.Precio != null)
                        .Select(d => new PrecioCotizacionDto { ProductoId = d.ProductoId, Precio = d.Precio.Value })
                        .ToList(),
                    Total = cotizacion.RespuestaTotal ?? 0,
                    Comentario = cotizacion.RespuestaComentario,
                    Fecha = Validaciones.Texto(cotizacion.RespuestaFecha),
                    Vigencia = Validaciones.Texto(cotizacion.Vigencia)
                };
            }

            return new CotizacionDto
            {
                Id = cotizacion.Id,
                ClienteId = cotizacion.ClienteId,
                VendedorId = cotizacion.VendedorId,
                Fecha = Validaciones.Texto(cotizacion.Fecha),
                Items = detalles
                    .Select(d => new ItemCotizacionDto { ProductoId = d.ProductoId, Nombre = d.Nombre, Cantidad = d.Cantidad })
                    .ToList(),
                Mensaje = cotizacion.Mensaje,
                FechaRequerida = cotizacion.FechaRequerida == null ? null : Validaciones.Texto(cotizacion.FechaRequerida),
                Estado = EstadoCotizacion(cotizacion),
                Respuesta = respuesta,
                Cliente = Nombres.Corto(cotizacion.Cliente),
                Tienda = Nombres.Tienda(cotizacion.Vendedor)
            };
        }

        public static CalificacionDto DeCalificacion(Calificacion calificacion)
        {
            return new CalificacionDto
            {
                Id = calificacion.Id,
                VentaId = calificacion.VentaId,
                ProductoId = calificacion.ProductoId,
                VendedorId = calificacion.VendedorId,
                ClienteId = calificacion.ClienteId,
                NotaProducto = calificacion.NotaProducto,
                NotaVendedor = calificacion.NotaVendedor,
                Comentario = calificacion.Comentario,
                Fecha = Validaciones.Texto(calificacion.Fecha),
                Cliente = Nombres.Primero(calificacion.Cliente)
            };
        }

        public static DevolucionDto DeDevolucion(Devolucion devolucion)
        {
            return new DevolucionDto
            {
                Id = devolucion.Id,
                VentaId = devolucion.VentaId,
                ClienteId = devolucion.ClienteId,
                VendedorId = devolucion.VendedorId,
                ProductoId = devolucion.ProductoId,
                NombreProducto = devolucion.NombreProducto,
                Cantidad = devolucion.Cantidad,
                Motivo = devolucion.Motivo,
                Detalle = devolucion.Detalle,
                Fecha = Validaciones.Texto(devolucion.Fecha),
                Estado = devolucion.Estado,
                Respuesta = devolucion.Respuesta,
                Monto = devolucion.Monto,
                Cliente = Nombres.Corto(devolucion.Cliente),
                Tienda = Nombres.Tienda(devolucion.Vendedor)
            };
        }

        public static MensajeDto DeMensaje(Mensaje mensaje)
        {
            return new MensajeDto
            {
                Id = mensaje.Id,
                ClienteId = mensaje.ClienteId,
                VendedorId = mensaje.VendedorId,
                AutorId = mensaje.AutorId,
                Texto = mensaje.Texto,
                Fecha = mensaje.Fecha.ToString("yyyy-MM-dd HH:mm", System.Globalization.CultureInfo.InvariantCulture)
            };
        }

        public static NotificacionDto DeNotificacion(Notificacion notificacion)
        {
            return new NotificacionDto
            {
                Id = notificacion.Id,
                UsuarioId = notificacion.UsuarioId,
                Texto = notificacion.Texto,
                Fecha = Validaciones.Texto(notificacion.Fecha),
                Leida = notificacion.Leida,
                Ruta = notificacion.Ruta
            };
        }
    }
}
