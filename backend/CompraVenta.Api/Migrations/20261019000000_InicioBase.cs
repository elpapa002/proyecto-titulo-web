using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using CompraVenta.Api.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CompraVenta.Api.Migrations
{
    // tablas del Avance 2 (las mismas de database/01_tablas.sql de esa version)
    [DbContext(typeof(AppDbContext))]
    [Migration("20261019000000_InicioBase")]
    public partial class InicioBase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "compania",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    rut = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    personas = table.Column<int>(type: "integer", nullable: false),
                    telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    correo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    sitio_web = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false, defaultValueSql: "''"),
                    direccion = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false, defaultValueSql: "''")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compania", x => x.id);
                    table.UniqueConstraint("AK_compania_rut", x => x.rut);
                    table.CheckConstraint("CK_compania_1", "personas >= 1");
                });

            migrationBuilder.CreateTable(
                name: "usuario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    run = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    nombres = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellidos = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    correo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    fecha_nacimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    fecha_ingreso = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    clave_hash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    es_cliente = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE"),
                    es_vendedor = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE"),
                    es_admin = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE"),
                    compania_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario", x => x.id);
                    table.UniqueConstraint("AK_usuario_run", x => x.run);
                    table.UniqueConstraint("AK_usuario_correo", x => x.correo);
                    table.CheckConstraint("CK_usuario_1", "es_cliente OR es_vendedor OR es_admin");
                    table.ForeignKey(name: "FK_usuario_compania_id", column: x => x.compania_id, principalTable: "compania", principalColumn: "id", onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "direccion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    calle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    numero = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    comuna = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    codigo_postal = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValueSql: "''"),
                    principal = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_direccion", x => x.id);
                    table.ForeignKey(name: "FK_direccion_usuario_id", column: x => x.usuario_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "telefono",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    numero = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_telefono", x => x.id);
                    table.UniqueConstraint("AK_telefono_numero", x => x.numero);
                    table.ForeignKey(name: "FK_telefono_usuario_id", column: x => x.usuario_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "categoria",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    nombre = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ruta = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    padre_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categoria", x => x.id);
                    table.UniqueConstraint("AK_categoria_ruta", x => x.ruta);
                    table.ForeignKey(name: "FK_categoria_padre_id", column: x => x.padre_id, principalTable: "categoria", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "producto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    tipo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sku = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValueSql: "''"),
                    categoria_id = table.Column<int>(type: "integer", nullable: false),
                    subcategoria_id = table.Column<int>(type: "integer", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    material = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValueSql: "''"),
                    peso = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "''"),
                    tamano = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValueSql: "''"),
                    color = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValueSql: "''"),
                    duracion = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "''"),
                    edad_minima = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    precio = table.Column<int>(type: "integer", nullable: false),
                    stock = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    estado = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    calificacion = table.Column<decimal>(type: "numeric(2,1)", nullable: false, defaultValueSql: "0"),
                    resenas = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_producto", x => x.id);
                    table.CheckConstraint("CK_producto_1", "tipo IN ('Producto', 'Servicio')");
                    table.CheckConstraint("CK_producto_2", "edad_minima BETWEEN 0 AND 99");
                    table.CheckConstraint("CK_producto_3", "precio > 0");
                    table.CheckConstraint("CK_producto_4", "stock >= 0");
                    table.CheckConstraint("CK_producto_5", "estado IN ('Publicada', 'Pausada', 'Borrador')");
                    table.CheckConstraint("CK_producto_6", "calificacion BETWEEN 0 AND 5");
                    table.CheckConstraint("CK_producto_7", "resenas >= 0");
                    table.ForeignKey(name: "FK_producto_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_producto_categoria_id", column: x => x.categoria_id, principalTable: "categoria", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_producto_subcategoria_id", column: x => x.subcategoria_id, principalTable: "categoria", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "oferta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    precio_oferta = table.Column<int>(type: "integer", nullable: false),
                    inicio = table.Column<DateOnly>(type: "date", nullable: false),
                    fin = table.Column<DateOnly>(type: "date", nullable: false),
                    difundir = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_oferta", x => x.id);
                    table.CheckConstraint("CK_oferta_1", "precio_oferta > 0");
                    table.CheckConstraint("CK_oferta_2", "fin >= inicio");
                    table.ForeignKey(name: "FK_oferta_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_oferta_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "costo_envio",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    comuna = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    costo = table.Column<int>(type: "integer", nullable: false),
                    dias = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_costo_envio", x => x.id);
                    table.UniqueConstraint("AK_costo_envio_vendedor_id_comuna", x => new { x.vendedor_id, x.comuna });
                    table.CheckConstraint("CK_costo_envio_1", "costo >= 0");
                    table.CheckConstraint("CK_costo_envio_2", "dias >= 1");
                    table.ForeignKey(name: "FK_costo_envio_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "venta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    envio = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    total = table.Column<int>(type: "integer", nullable: false),
                    medio_tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    medio_marca = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "''"),
                    medio_ultimos4 = table.Column<string>(type: "character(4)", maxLength: 4, nullable: true),
                    estado_transaccion = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    estado_pedido = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    direccion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    empresa_transporte = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "''"),
                    seguimiento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "''"),
                    calificada = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_venta", x => x.id);
                    table.CheckConstraint("CK_venta_1", "envio >= 0");
                    table.CheckConstraint("CK_venta_2", "total >= 0");
                    table.CheckConstraint("CK_venta_3", "estado_transaccion IN ('Pendiente', 'Completada', 'Cancelada')");
                    table.CheckConstraint("CK_venta_4", "estado_pedido IN ('Pagado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado')");
                    table.ForeignKey(name: "FK_venta_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_venta_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "detalle_venta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    venta_id = table.Column<int>(type: "integer", nullable: false),
                    producto_id = table.Column<int>(type: "integer", nullable: true),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    precio = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_detalle_venta", x => x.id);
                    table.CheckConstraint("CK_detalle_venta_1", "cantidad >= 1");
                    table.CheckConstraint("CK_detalle_venta_2", "precio >= 0");
                    table.ForeignKey(name: "FK_detalle_venta_venta_id", column: x => x.venta_id, principalTable: "venta", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_detalle_venta_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "pregunta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    texto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    respuesta = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false, defaultValueSql: "''"),
                    fecha_respuesta = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pregunta", x => x.id);
                    table.ForeignKey(name: "FK_pregunta_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_pregunta_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cotizacion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    mensaje = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    fecha_requerida = table.Column<DateOnly>(type: "date", nullable: true),
                    estado = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    respuesta_total = table.Column<int>(type: "integer", nullable: true),
                    respuesta_comentario = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValueSql: "''"),
                    respuesta_fecha = table.Column<DateOnly>(type: "date", nullable: true),
                    vigencia = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cotizacion", x => x.id);
                    table.CheckConstraint("CK_cotizacion_1", "estado IN ('Pendiente', 'Respondida', 'Aceptada', 'Rechazada')");
                    table.CheckConstraint("CK_cotizacion_2", "respuesta_total >= 0");
                    table.ForeignKey(name: "FK_cotizacion_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_cotizacion_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "detalle_cotizacion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    cotizacion_id = table.Column<int>(type: "integer", nullable: false),
                    producto_id = table.Column<int>(type: "integer", nullable: true),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    precio = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_detalle_cotizacion", x => x.id);
                    table.CheckConstraint("CK_detalle_cotizacion_1", "cantidad >= 1");
                    table.CheckConstraint("CK_detalle_cotizacion_2", "precio >= 0");
                    table.ForeignKey(name: "FK_detalle_cotizacion_cotizacion_id", column: x => x.cotizacion_id, principalTable: "cotizacion", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_detalle_cotizacion_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "calificacion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    venta_id = table.Column<int>(type: "integer", nullable: false),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    nota_producto = table.Column<int>(type: "integer", nullable: false),
                    nota_vendedor = table.Column<int>(type: "integer", nullable: false),
                    comentario = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false, defaultValueSql: "''"),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_calificacion", x => x.id);
                    table.CheckConstraint("CK_calificacion_1", "nota_producto BETWEEN 1 AND 5");
                    table.CheckConstraint("CK_calificacion_2", "nota_vendedor BETWEEN 1 AND 5");
                    table.ForeignKey(name: "FK_calificacion_venta_id", column: x => x.venta_id, principalTable: "venta", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_calificacion_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_calificacion_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_calificacion_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "devolucion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    venta_id = table.Column<int>(type: "integer", nullable: false),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    nombre_producto = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    motivo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    detalle = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValueSql: "''"),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    estado = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    respuesta = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false, defaultValueSql: "''"),
                    monto = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_devolucion", x => x.id);
                    table.CheckConstraint("CK_devolucion_1", "cantidad >= 1");
                    table.CheckConstraint("CK_devolucion_2", "estado IN ('Pendiente', 'Aprobada', 'Rechazada')");
                    table.CheckConstraint("CK_devolucion_3", "monto >= 0");
                    table.ForeignKey(name: "FK_devolucion_venta_id", column: x => x.venta_id, principalTable: "venta", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_devolucion_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_devolucion_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(name: "FK_devolucion_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "mensaje",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    cliente_id = table.Column<int>(type: "integer", nullable: false),
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    autor_id = table.Column<int>(type: "integer", nullable: false),
                    texto = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mensaje", x => x.id);
                    table.CheckConstraint("CK_mensaje_1", "autor_id = cliente_id OR autor_id = vendedor_id");
                    table.ForeignKey(name: "FK_mensaje_cliente_id", column: x => x.cliente_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_mensaje_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_mensaje_autor_id", column: x => x.autor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notificacion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    texto = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    leida = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE"),
                    ruta = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false, defaultValueSql: "''")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificacion", x => x.id);
                    table.ForeignKey(name: "FK_notificacion_usuario_id", column: x => x.usuario_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });
            // el SKU no se repite dentro de las publicaciones de un mismo emprendedor (los servicios van sin SKU)
            migrationBuilder.CreateIndex(
                name: "producto_vendedor_sku",
                table: "producto",
                columns: new[] { "vendedor_id", "sku" },
                unique: true,
                filter: "sku <> ''");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "notificacion");
            migrationBuilder.DropTable(name: "mensaje");
            migrationBuilder.DropTable(name: "devolucion");
            migrationBuilder.DropTable(name: "calificacion");
            migrationBuilder.DropTable(name: "detalle_cotizacion");
            migrationBuilder.DropTable(name: "cotizacion");
            migrationBuilder.DropTable(name: "pregunta");
            migrationBuilder.DropTable(name: "detalle_venta");
            migrationBuilder.DropTable(name: "venta");
            migrationBuilder.DropTable(name: "costo_envio");
            migrationBuilder.DropTable(name: "oferta");
            migrationBuilder.DropTable(name: "producto");
            migrationBuilder.DropTable(name: "categoria");
            migrationBuilder.DropTable(name: "telefono");
            migrationBuilder.DropTable(name: "direccion");
            migrationBuilder.DropTable(name: "usuario");
            migrationBuilder.DropTable(name: "compania");
        }
    }
}
