-- Compra y Venta: creación de tablas

DROP TABLE IF EXISTS notificacion, mensaje, devolucion, calificacion, detalle_cotizacion, cotizacion, pregunta,
    detalle_venta, venta, costo_envio, oferta, producto, categoria, telefono, direccion, usuario, compania CASCADE;

CREATE TABLE compania (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    personas INTEGER NOT NULL CHECK (personas >= 1),
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    sitio_web VARCHAR(120) NOT NULL DEFAULT '',
    direccion VARCHAR(150) NOT NULL DEFAULT ''
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    run VARCHAR(12) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    clave_hash VARCHAR(100) NOT NULL,
    es_cliente BOOLEAN NOT NULL DEFAULT FALSE,
    es_vendedor BOOLEAN NOT NULL DEFAULT FALSE,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    compania_id INTEGER REFERENCES compania(id) ON DELETE SET NULL,
    CHECK (es_cliente OR es_vendedor OR es_admin)
);

CREATE TABLE direccion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    calle VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    comuna VARCHAR(50) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL DEFAULT '',
    principal BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE telefono (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    ruta VARCHAR(80) NOT NULL UNIQUE,
    padre_id INTEGER REFERENCES categoria(id)
);

CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('Producto', 'Servicio')),
    nombre VARCHAR(100) NOT NULL,
    sku VARCHAR(20) NOT NULL DEFAULT '',
    categoria_id INTEGER NOT NULL REFERENCES categoria(id),
    subcategoria_id INTEGER NOT NULL REFERENCES categoria(id),
    descripcion VARCHAR(1000) NOT NULL,
    material VARCHAR(100) NOT NULL DEFAULT '',
    peso VARCHAR(30) NOT NULL DEFAULT '',
    tamano VARCHAR(60) NOT NULL DEFAULT '',
    color VARCHAR(60) NOT NULL DEFAULT '',
    duracion VARCHAR(30) NOT NULL DEFAULT '',
    edad_minima INTEGER NOT NULL DEFAULT 0 CHECK (edad_minima BETWEEN 0 AND 99),
    precio INTEGER NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    estado VARCHAR(10) NOT NULL CHECK (estado IN ('Publicada', 'Pausada', 'Borrador')),
    calificacion NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (calificacion BETWEEN 0 AND 5),
    resenas INTEGER NOT NULL DEFAULT 0 CHECK (resenas >= 0)
);

CREATE UNIQUE INDEX producto_vendedor_sku ON producto (vendedor_id, sku) WHERE sku <> '';

CREATE TABLE oferta (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    producto_id INTEGER NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    precio_oferta INTEGER NOT NULL CHECK (precio_oferta > 0),
    inicio DATE NOT NULL,
    fin DATE NOT NULL,
    difundir BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (fin >= inicio)
);

CREATE TABLE costo_envio (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    comuna VARCHAR(50) NOT NULL,
    costo INTEGER NOT NULL CHECK (costo >= 0),
    dias INTEGER NOT NULL CHECK (dias >= 1),
    UNIQUE (vendedor_id, comuna)
);

CREATE TABLE venta (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuario(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    envio INTEGER NOT NULL DEFAULT 0 CHECK (envio >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    medio_tipo VARCHAR(20) NOT NULL,
    medio_marca VARCHAR(30) NOT NULL DEFAULT '',
    medio_ultimos4 CHAR(4),
    estado_transaccion VARCHAR(12) NOT NULL CHECK (estado_transaccion IN ('Pendiente', 'Completada', 'Cancelada')),
    estado_pedido VARCHAR(15) NOT NULL CHECK (estado_pedido IN ('Pagado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado')),
    direccion VARCHAR(200) NOT NULL,
    empresa_transporte VARCHAR(50) NOT NULL DEFAULT '',
    seguimiento VARCHAR(50) NOT NULL DEFAULT '',
    calificada BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE detalle_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES venta(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES producto(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 1),
    precio INTEGER NOT NULL CHECK (precio >= 0)
);

CREATE TABLE pregunta (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    texto VARCHAR(500) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    respuesta VARCHAR(500) NOT NULL DEFAULT '',
    fecha_respuesta DATE
);

CREATE TABLE cotizacion (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuario(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    mensaje VARCHAR(1000) NOT NULL,
    fecha_requerida DATE,
    estado VARCHAR(12) NOT NULL CHECK (estado IN ('Pendiente', 'Respondida', 'Aceptada', 'Rechazada')),
    respuesta_total INTEGER CHECK (respuesta_total >= 0),
    respuesta_comentario VARCHAR(1000) NOT NULL DEFAULT '',
    respuesta_fecha DATE,
    vigencia DATE
);

CREATE TABLE detalle_cotizacion (
    id SERIAL PRIMARY KEY,
    cotizacion_id INTEGER NOT NULL REFERENCES cotizacion(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES producto(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 1),
    precio INTEGER CHECK (precio >= 0)
);

CREATE TABLE calificacion (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES venta(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES producto(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    cliente_id INTEGER NOT NULL REFERENCES usuario(id),
    nota_producto INTEGER NOT NULL CHECK (nota_producto BETWEEN 1 AND 5),
    nota_vendedor INTEGER NOT NULL CHECK (nota_vendedor BETWEEN 1 AND 5),
    comentario VARCHAR(500) NOT NULL DEFAULT '',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE devolucion (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES venta(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES usuario(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id),
    producto_id INTEGER NOT NULL REFERENCES producto(id),
    nombre_producto VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 1),
    motivo VARCHAR(100) NOT NULL,
    detalle VARCHAR(1000) NOT NULL DEFAULT '',
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(10) NOT NULL CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada')),
    respuesta VARCHAR(1000) NOT NULL DEFAULT '',
    monto INTEGER NOT NULL CHECK (monto >= 0)
);

CREATE TABLE mensaje (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    vendedor_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    texto VARCHAR(1000) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (autor_id = cliente_id OR autor_id = vendedor_id)
);

CREATE TABLE notificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    texto VARCHAR(300) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    ruta VARCHAR(150) NOT NULL DEFAULT ''
);
