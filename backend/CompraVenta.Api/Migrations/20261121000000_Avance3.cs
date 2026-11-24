using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using CompraVenta.Api.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CompraVenta.Api.Migrations
{
    // Avance 3: variantes, fotos, relacionados, configuracion de envio, correos adicionales y retiro en el local
    [DbContext(typeof(AppDbContext))]
    [Migration("20261121000000_Avance3")]
    public partial class Avance3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "correo_adicional",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    correo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_correo_adicional", x => x.id);
                    table.UniqueConstraint("AK_correo_adicional_correo", x => x.correo);
                    table.ForeignKey(name: "FK_correo_adicional_usuario_id", column: x => x.usuario_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "variante",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    talla = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValueSql: "''"),
                    color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValueSql: "''"),
                    sku = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    stock = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    precio = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_variante", x => x.id);
                    table.UniqueConstraint("AK_variante_producto_id_talla_color", x => new { x.producto_id, x.talla, x.color });
                    table.CheckConstraint("CK_variante_1", "stock >= 0");
                    table.CheckConstraint("CK_variante_2", "precio > 0");
                    table.CheckConstraint("CK_variante_3", "talla <> '' OR color <> ''");
                    table.ForeignKey(name: "FK_variante_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "foto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    orden = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    datos = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_foto", x => x.id);
                    table.CheckConstraint("CK_foto_1", "tipo IN ('image/jpeg', 'image/png', 'image/webp')");
                    table.ForeignKey(name: "FK_foto_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "producto_relacionado",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    producto_id = table.Column<int>(type: "integer", nullable: false),
                    relacionado_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_producto_relacionado", x => x.id);
                    table.UniqueConstraint("AK_producto_relacionado_producto_id_relacionado_id", x => new { x.producto_id, x.relacionado_id });
                    table.CheckConstraint("CK_producto_relacionado_1", "producto_id <> relacionado_id");
                    table.ForeignKey(name: "FK_producto_relacionado_producto_id", column: x => x.producto_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_producto_relacionado_relacionado_id", column: x => x.relacionado_id, principalTable: "producto", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "configuracion_envio",
                columns: table => new
                {
                    vendedor_id = table.Column<int>(type: "integer", nullable: false),
                    forma = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValueSql: "'Comuna'"),
                    costo_base = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    costo_kilo = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "0"),
                    tamano_maximo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValueSql: "''"),
                    retiro_local = table.Column<bool>(type: "boolean", nullable: false, defaultValueSql: "FALSE"),
                    direccion_retiro = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false, defaultValueSql: "''")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracion_envio", x => x.vendedor_id);
                    table.CheckConstraint("CK_configuracion_envio_1", "forma IN ('Comuna', 'Peso')");
                    table.CheckConstraint("CK_configuracion_envio_2", "costo_base >= 0");
                    table.CheckConstraint("CK_configuracion_envio_3", "costo_kilo >= 0");
                    table.CheckConstraint("CK_configuracion_envio_4", "NOT retiro_local OR direccion_retiro <> ''");
                    table.ForeignKey(name: "FK_configuracion_envio_vendedor_id", column: x => x.vendedor_id, principalTable: "usuario", principalColumn: "id", onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.AddColumn<string>(
                name: "texto_alternativo",
                table: "producto",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValueSql: "''");

            migrationBuilder.AddColumn<bool>(
                name: "retiro",
                table: "venta",
                type: "boolean",
                nullable: false,
                defaultValueSql: "FALSE");

            migrationBuilder.AddColumn<int>(
                name: "variante_id",
                table: "detalle_venta",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_detalle_venta_variante_id",
                table: "detalle_venta",
                column: "variante_id",
                principalTable: "variante",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            // el nombre del detalle ahora incluye la talla y el color
            migrationBuilder.AlterColumn<string>(
                name: "nombre",
                table: "detalle_venta",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_detalle_venta_variante_id", table: "detalle_venta");
            migrationBuilder.DropColumn(name: "variante_id", table: "detalle_venta");
            migrationBuilder.DropColumn(name: "retiro", table: "venta");
            migrationBuilder.DropColumn(name: "texto_alternativo", table: "producto");
            migrationBuilder.AlterColumn<string>(
                name: "nombre",
                table: "detalle_venta",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);
            migrationBuilder.DropTable(name: "configuracion_envio");
            migrationBuilder.DropTable(name: "producto_relacionado");
            migrationBuilder.DropTable(name: "foto");
            migrationBuilder.DropTable(name: "variante");
            migrationBuilder.DropTable(name: "correo_adicional");
        }
    }
}
