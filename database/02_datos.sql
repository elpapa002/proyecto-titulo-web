-- Compra y Venta: datos de ejemplo (los mismos de src/services/datosPrueba.js, clave de todos: Clave2026)

INSERT INTO compania (id, rut, nombre, personas, telefono, correo, sitio_web, direccion) VALUES
    (1, '76.543.210-3', 'Darnell Bros', 4, '+56 64 223 4567', 'contacto@darnellbros.cl', 'darnellbros.cl', 'Ramírez 1150, Osorno'),
    (2, '77.112.908-0', 'Maderas Manny', 3, '+56 64 231 0098', 'ventas@maderasrahue.cl', '', ''),
    (3, '76.998.201-9', 'Apícola Los Volcanes', 2, '+56 9 7788 1122', 'hola@mielvolcanes.cl', 'mielvolcanes.cl', ''),
    (4, '77.450.332-3', 'Cervecera Rahue SpA', 6, '+56 64 245 7710', 'contacto@cerveceriarahue.cl', 'cerveceriarahue.cl', 'Av. República 520, Osorno'),
    (5, '76.321.987-9', 'Greda Viva', 2, '+56 9 6543 2109', 'hola@gredaviva.cl', 'gredaviva.cl', 'Mackenna 845, Osorno');

INSERT INTO usuario (id, run, nombres, apellidos, correo, fecha_nacimiento, fecha_ingreso, clave_hash, es_cliente, es_vendedor, es_admin, compania_id) VALUES
    (1, '20.456.789-1', 'Camila Andrea', 'Rojas Pérez', 'camila.rojas@gmail.com', '2001-03-14', '2026-03-12', '$2b$10$iov4PKOG6RZCy6S37ZS8QerDr9GV6yrSOp5XxfMcXV/SEo1D3CKbe', TRUE, FALSE, FALSE, NULL),
    (2, '16.903.557-1', 'Diego', 'Fuentes Soto', 'diego.fuentes@gmail.com', '1988-07-02', '2025-01-25', '$2b$10$F5M7VjGZ/W8S2XlwFl28yukn7S3S1AJt/YINQETZAgCrB.c5LIxhG', TRUE, TRUE, FALSE, 1),
    (3, '18.221.904-5', 'Jesús', 'Nazar Ruiz', 'jesus.nazar@gmail.com', '1992-11-20', '2024-09-19', '$2b$10$w8O08JK1lw8vknY4lNiQaejyYMigw9eoi0wBVBGzz51Xtv2AFcnrq', FALSE, TRUE, FALSE, 2),
    (4, '17.560.118-K', 'Lucía', 'Maestri Vera', 'lucia.maestri@gmail.com', '1990-05-08', '2025-10-21', '$2b$10$cU26sx2LirhqmbBzsoTRUOGYCDEVQzbro8nV0h4CbKBLvoMZ3WLzi', TRUE, TRUE, FALSE, 3),
    (5, '15.338.270-0', 'Amaru', 'Muñoz Paillán', 'amaru.munoz@gmail.com', '1984-01-30', '2025-11-26', '$2b$10$NA8trn94Q9qiLbSHtuC6ueKCEXwEXmTtnuiG7wZCD4eVxnbxcx7om', TRUE, TRUE, FALSE, 4),
    (6, '11.111.111-1', 'Carlos', 'Run Molina', 'admin@compraventa.cl', '1979-06-15', '2024-01-02', '$2b$10$oT37XVrEii6kQxaZ2jrnYONBVWVD9CDMccCs95fSPYIL6v4Cn8Gha', FALSE, FALSE, TRUE, NULL),
    (7, '19.876.543-0', 'Rosa', 'Catalán Oyarzo', 'rosa.catalan@gmail.com', '1997-02-11', '2025-06-14', '$2b$10$D6FtaETa14W7opohA1B9ZO9GcQPQngsJQe9cDJl1J7rgqAO7yruPS', FALSE, TRUE, FALSE, 5),
    (8, '20.112.233-3', 'Matías', 'Soto Barría', 'matias.soto@gmail.com', '1999-09-03', '2026-02-03', '$2b$10$qAW2HWYZlPL/NaYRGeilYetpbv5wZjllN2VhpLDP0FLn0mfp.Fu0a', TRUE, FALSE, FALSE, NULL),
    (9, '21.345.678-4', 'Fernanda', 'Vidal Cárcamo', 'fernanda.vidal@gmail.com', '2003-04-25', '2026-05-19', '$2b$10$Kbq1o.0mbKEmSE5xoaPRz.6qHm3UQoCbc16YPWghDfEnS1Gn/LaTi', TRUE, FALSE, FALSE, NULL),
    (10, '18.765.432-7', 'Tomás', 'Aguilar Ríos', 'tomas.aguilar@gmail.com', '1994-12-01', '2025-08-30', '$2b$10$ZLDYKCm7Im5OvyWvrc16wuLGhG.N3GE9GVy9d008TugjEkz3qOSfW', TRUE, FALSE, FALSE, NULL),
    (11, '16.543.219-3', 'Valentina', 'Paredes Gómez', 'valentina.paredes@gmail.com', '1987-08-17', '2024-12-11', '$2b$10$N8MRczJKv0pCpcn.iP2QxeBlpYXHdl8LNcn3Hf2Wz8UfifYPJfTia', TRUE, FALSE, FALSE, NULL),
    (12, '22.334.455-0', 'Ignacio', 'Barrientos Uribe', 'ignacio.barrientos@gmail.com', '2006-10-09', '2026-09-02', '$2b$10$s7ToAyJcGG2y0q0NOXfVtef.Kot2HqeI3ALoKdbzzevVwhu4Ubtpa', TRUE, FALSE, FALSE, NULL);

INSERT INTO direccion (id, usuario_id, calle, numero, comuna, codigo_postal, principal) VALUES
    (1, 1, 'Av. Juan Mackenna', '1270', 'Osorno', '5290000', TRUE),
    (2, 1, 'San José', '415', 'Puerto Varas', '5550000', FALSE),
    (3, 2, 'Ramírez', '1150', 'Osorno', '5290000', TRUE);

INSERT INTO telefono (id, usuario_id, numero) VALUES
    (1, 1, '+56 9 8765 4321'),
    (2, 2, '+56 9 7123 4567');

INSERT INTO correo_adicional (id, usuario_id, correo) VALUES
    (1, 1, 'camila.rojas@outlook.com');

INSERT INTO categoria (id, nombre, ruta, padre_id) VALUES
    (1, 'Alimentos', 'alimentos', NULL),
    (2, 'Artesanía', 'artesania', NULL),
    (3, 'Vestuario', 'vestuario', NULL),
    (4, 'Servicios', 'servicios', NULL),
    (11, 'Mermeladas y conservas', 'mermeladas', 1),
    (12, 'Miel', 'miel', 1),
    (13, 'Cervezas artesanales', 'cervezas', 1),
    (21, 'Cerámica', 'ceramica', 2),
    (22, 'Madera', 'madera', 2),
    (23, 'Tejidos', 'tejidos', 2),
    (31, 'Ropa', 'ropa', 3),
    (32, 'Accesorios', 'accesorios', 3),
    (41, 'Reparaciones', 'reparaciones', 4),
    (42, 'Clases y talleres', 'clases', 4),
    (43, 'Eventos', 'eventos', 4);

INSERT INTO producto (id, vendedor_id, tipo, nombre, sku, categoria_id, subcategoria_id, descripcion, material, peso, tamano, color, duracion, edad_minima, precio, stock, estado, calificacion, resenas) VALUES
    (1, 2, 'Producto', 'Polerón bordado Osorno', 'TDS-POL', 3, 31, 'Polerón de algodón orgánico con bordado de los volcanes de Osorno hecho a mano.', 'Algodón orgánico', '450 g', 'Tallas S a XL', 'Gris, azul marino y negro', '', 0, 24990, 14, 'Publicada', 4.8, 126),
    (2, 2, 'Producto', 'Gorro de lana chilota', 'TDS-GOR', 3, 32, 'Gorro tejido a palillo con lana de oveja de Chiloé.', 'Lana de oveja', '120 g', 'Talla única', 'Natural y gris', '', 0, 9990, 12, 'Publicada', 4.7, 58),
    (3, 2, 'Producto', 'Bufanda de lana merino', 'TDS-BUF', 3, 32, 'Bufanda suave de lana merino tejida en telar.', 'Lana merino', '180 g', '180 x 30 cm', 'Azul marino', '', 0, 14990, 2, 'Publicada', 4.9, 34),
    (4, 2, 'Producto', 'Polerón infantil bordado', 'TDS-PIN', 3, 31, 'Polerón para niños con bordado de copihue.', 'Algodón', '300 g', 'Tallas 4 a 12', 'Rojo y gris', '', 0, 14990, 0, 'Pausada', 4.6, 21),
    (5, 2, 'Servicio', 'Taller de bordado a mano', '', 4, 42, 'Taller presencial para aprender los puntos básicos del bordado.', '', '', '', '', '3 horas', 12, 18000, 8, 'Publicada', 4.9, 17),
    (6, 2, 'Producto', 'Polerón liso de algodón', 'TDS-PLI', 3, 31, 'Polerón liso de algodón, ideal para estampar o bordar.', 'Algodón', '420 g', 'Tallas S a XL', 'Blanco y negro', '', 0, 17990, 20, 'Borrador', 0, 0),
    (7, 3, 'Producto', 'Tabla de raulí para picoteo', 'MMA-TAB', 2, 22, 'Tabla de madera de raulí con terminación en aceite natural.', 'Raulí', '900 g', '40 x 20 cm', 'Natural', '', 0, 18990, 9, 'Publicada', 4.8, 64),
    (8, 3, 'Servicio', 'Reparación de muebles de madera', '', 4, 41, 'Reparamos y barnizamos muebles de madera nativa en Osorno.', '', '', '', '', '1 a 3 días', 0, 25000, 4, 'Publicada', 4.5, 12),
    (9, 4, 'Producto', 'Miel de ulmo 500 g', 'ALV-MIE', 1, 12, 'Miel de ulmo cosechada en la precordillera de Osorno.', 'Miel de ulmo', '500 g', 'Frasco de vidrio', 'Ámbar claro', '', 0, 6500, 40, 'Publicada', 4.9, 210),
    (10, 4, 'Producto', 'Mermelada de murta 250 g', 'ALV-MUR', 1, 11, 'Mermelada artesanal de murta del sur.', 'Murta', '250 g', 'Frasco de vidrio', 'Rojo oscuro', '', 0, 3990, 25, 'Publicada', 4.7, 88),
    (11, 4, 'Producto', 'Pack de miel y mermeladas', 'ALV-PAC', 1, 12, 'Caja de regalo con miel de ulmo y dos mermeladas.', 'Miel y fruta', '1 kg', 'Caja de cartón', 'Natural', '', 0, 16990, 7, 'Publicada', 4.8, 40),
    (12, 5, 'Servicio', 'Clase de cerveza artesanal', '', 4, 42, 'Clase práctica de elaboración de cerveza con degustación.', '', '', '', '', '4 horas', 18, 25000, 10, 'Publicada', 4.8, 45),
    (13, 5, 'Producto', 'Pack de cervezas artesanales', 'CRA-PAC', 1, 13, 'Pack de 6 cervezas artesanales de distintos estilos.', 'Cerveza artesanal', '2,4 kg', '6 botellas de 330 ml', 'Rubia, roja y negra', '', 0, 14990, 18, 'Publicada', 4.6, 73),
    (14, 7, 'Producto', 'Taza de greda artesanal', 'GRV-TAZ', 2, 21, 'Taza de greda hecha y pintada a mano.', 'Greda', '350 g', '300 ml', 'Negro con blanco', '', 0, 8990, 15, 'Publicada', 4.8, 96),
    (15, 7, 'Producto', 'Set de platos de greda', 'GRV-PLA', 2, 21, 'Set de 4 platos de greda para servir.', 'Greda', '2 kg', '4 platos de 24 cm', 'Negro', '', 0, 29990, 5, 'Publicada', 4.7, 31);

-- el polerón se vende por talla y color; el stock del producto (14) es la suma de sus variantes
INSERT INTO variante (id, producto_id, talla, color, sku, stock, precio) VALUES
    (1, 1, 'S', 'Gris', 'TDS-POL-S-GR', 3, 24990),
    (2, 1, 'M', 'Azul marino', 'TDS-POL-M-AZ', 4, 24990),
    (3, 1, 'L', 'Azul marino', 'TDS-POL-L-AZ', 4, 24990),
    (4, 1, 'XL', 'Negro', 'TDS-POL-XL-NE', 3, 26990);

INSERT INTO producto_relacionado (id, producto_id, relacionado_id) VALUES
    (1, 1, 3),
    (2, 1, 2),
    (3, 9, 11);

INSERT INTO oferta (id, vendedor_id, producto_id, precio_oferta, inicio, fin, difundir) VALUES
    (1, 2, 1, 19990, CURRENT_DATE - 15, CURRENT_DATE + 45, TRUE),
    (2, 2, 2, 8490, CURRENT_DATE - 60, CURRENT_DATE - 30, FALSE),
    (3, 3, 7, 15990, CURRENT_DATE - 15, CURRENT_DATE + 45, TRUE),
    (4, 4, 11, 14990, CURRENT_DATE - 10, CURRENT_DATE + 30, TRUE),
    (5, 5, 13, 12990, CURRENT_DATE - 15, CURRENT_DATE + 14, FALSE),
    (6, 7, 15, 25490, CURRENT_DATE - 5, CURRENT_DATE + 45, TRUE);

INSERT INTO costo_envio (id, vendedor_id, comuna, costo, dias) VALUES
    (1, 2, 'Osorno', 2990, 1),
    (2, 2, 'Puerto Montt', 4990, 2),
    (3, 2, 'Puerto Varas', 4490, 2),
    (4, 2, 'Castro', 6990, 4),
    (5, 3, 'Osorno', 3990, 2),
    (6, 4, 'Osorno', 2990, 1),
    (7, 4, 'Puerto Varas', 3990, 2),
    (8, 5, 'Osorno', 3490, 1),
    (9, 7, 'Osorno', 2990, 1),
    (10, 7, 'Puerto Varas', 4990, 3),
    (11, 2, 'Resto de la región', 7990, 5);

-- Darnell Bros cobra por comuna y permite retirar en su local; Apícola Los Volcanes cobra según el peso
INSERT INTO configuracion_envio (vendedor_id, forma, costo_base, costo_kilo, tamano_maximo, retiro_local, direccion_retiro) VALUES
    (2, 'Comuna', 0, 0, '60 × 40 × 40 cm', TRUE, 'Ramírez 1150, Osorno'),
    (4, 'Peso', 2990, 1200, '60 × 40 × 40 cm', FALSE, '');

INSERT INTO venta (id, cliente_id, vendedor_id, fecha, envio, total, medio_tipo, medio_marca, medio_ultimos4, estado_transaccion, estado_pedido, direccion, empresa_transporte, seguimiento, calificada) VALUES
    (10412, 1, 7, '2026-09-26', 2990, 20970, 'Débito', 'Visa', '4821', 'Completada', 'Entregado', 'Av. Juan Mackenna 1270, Osorno', 'Starken', 'STK-871560', TRUE),
    (10430, 12, 2, '2026-10-01', 2990, 17980, 'Débito', 'Visa', '9034', 'Cancelada', 'Cancelado', 'Freire 455, Osorno', '', '', FALSE),
    (10436, 8, 2, '2026-10-03', 2990, 17980, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Starken', 'STK-880102', FALSE),
    (10441, 9, 2, '2026-10-07', 2990, 22980, 'Débito', 'Mastercard', '6602', 'Pendiente', 'Pagado', 'Los Carrera 870, Osorno', '', '', FALSE),
    (10447, 10, 2, '2026-10-09', 2990, 32970, 'Crédito', 'Visa', '3345', 'Completada', 'En preparación', 'Bilbao 1340, Osorno', '', '', FALSE),
    (10452, 11, 2, '2026-10-11', 4990, 29970, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Starken', 'STK-887441', TRUE),
    (10455, 1, 4, '2026-10-12', 2990, 13480, 'Crédito', 'Mastercard', '1093', 'Completada', 'Entregado', 'Av. Juan Mackenna 1270, Osorno', 'Chilexpress', 'CHX-55120934', FALSE),
    (10458, 1, 2, '2026-10-14', 2990, 42970, 'Débito', 'Visa', '4821', 'Completada', 'Enviado', 'Av. Juan Mackenna 1270, Osorno', 'Starken', 'STK-889120', FALSE),
    (10200, 8, 2, '2026-05-06', 2990, 37970, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Starken', 'STK-710200', TRUE),
    (10201, 10, 2, '2026-05-19', 2990, 17980, 'Crédito', 'Visa', '3345', 'Completada', 'Entregado', 'Bilbao 1340, Osorno', 'Chilexpress', 'CHX-710201', FALSE),
    (10202, 11, 2, '2026-05-28', 4990, 24970, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Starken', 'STK-710202', FALSE),
    (10203, 9, 2, '2026-06-04', 2990, 27980, 'Débito', 'Mastercard', '6602', 'Completada', 'Entregado', 'Los Carrera 870, Osorno', 'Chilexpress', 'CHX-710203', TRUE),
    (10204, 10, 4, '2026-06-10', 2990, 19980, 'Crédito', 'Visa', '3345', 'Completada', 'Entregado', 'Bilbao 1340, Osorno', 'Starken', 'STK-710204', FALSE),
    (10205, 12, 2, '2026-06-15', 2990, 20990, 'Débito', 'Visa', '9034', 'Completada', 'Entregado', 'Freire 455, Osorno', 'Chilexpress', 'CHX-710205', FALSE),
    (10206, 8, 2, '2026-06-22', 2990, 27970, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Starken', 'STK-710206', FALSE),
    (10207, 8, 3, '2026-06-27', 2990, 21980, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Chilexpress', 'CHX-710207', FALSE),
    (10208, 10, 2, '2026-07-03', 2990, 52970, 'Crédito', 'Visa', '3345', 'Completada', 'Entregado', 'Bilbao 1340, Osorno', 'Starken', 'STK-710208', TRUE),
    (10209, 10, 7, '2026-07-07', 2990, 20970, 'Crédito', 'Visa', '3345', 'Completada', 'Entregado', 'Bilbao 1340, Osorno', 'Chilexpress', 'CHX-710209', FALSE),
    (10210, 11, 2, '2026-07-12', 4990, 29970, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Starken', 'STK-710210', FALSE),
    (10211, 11, 4, '2026-07-18', 4990, 21980, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Chilexpress', 'CHX-710211', FALSE),
    (10212, 9, 2, '2026-07-25', 2990, 42970, 'Débito', 'Mastercard', '6602', 'Completada', 'Entregado', 'Los Carrera 870, Osorno', 'Starken', 'STK-710212', TRUE),
    (10213, 12, 2, '2026-08-02', 2990, 12980, 'Débito', 'Visa', '9034', 'Completada', 'Entregado', 'Freire 455, Osorno', 'Chilexpress', 'CHX-710213', FALSE),
    (10214, 9, 4, '2026-08-08', 2990, 9490, 'Débito', 'Mastercard', '6602', 'Completada', 'Entregado', 'Los Carrera 870, Osorno', 'Starken', 'STK-710214', FALSE),
    (10215, 8, 2, '2026-08-14', 2990, 27980, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Chilexpress', 'CHX-710215', TRUE),
    (10216, 10, 2, '2026-08-21', 2990, 38990, 'Crédito', 'Visa', '3345', 'Completada', 'Entregado', 'Bilbao 1340, Osorno', 'Starken', 'STK-710216', FALSE),
    (10217, 11, 7, '2026-08-26', 4990, 34980, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Chilexpress', 'CHX-710217', FALSE),
    (10218, 11, 2, '2026-08-30', 4990, 44970, 'Débito', 'Visa', '7710', 'Completada', 'Entregado', 'Santa Rosa 560, Puerto Montt', 'Starken', 'STK-710218', FALSE),
    (10219, 9, 2, '2026-09-05', 2990, 32970, 'Débito', 'Mastercard', '6602', 'Completada', 'Entregado', 'Los Carrera 870, Osorno', 'Chilexpress', 'CHX-710219', FALSE),
    (10220, 9, 3, '2026-09-09', 2990, 21980, 'Débito', 'Mastercard', '6602', 'Completada', 'Entregado', 'Los Carrera 870, Osorno', 'Starken', 'STK-710220', FALSE),
    (10221, 12, 2, '2026-09-13', 2990, 62960, 'Débito', 'Visa', '9034', 'Completada', 'Entregado', 'Freire 455, Osorno', 'Chilexpress', 'CHX-710221', TRUE),
    (10222, 12, 4, '2026-09-17', 2990, 10970, 'Débito', 'Visa', '9034', 'Completada', 'Entregado', 'Freire 455, Osorno', 'Starken', 'STK-710222', FALSE),
    (10223, 8, 2, '2026-09-22', 2990, 12980, 'Crédito', 'Visa', '2218', 'Completada', 'Entregado', 'Manuel Rodríguez 1020, Osorno', 'Chilexpress', 'CHX-710223', FALSE);

INSERT INTO detalle_venta (id, venta_id, producto_id, nombre, cantidad, precio) VALUES
    (1, 10412, 14, 'Taza de greda artesanal', 2, 8990),
    (2, 10430, 4, 'Polerón infantil bordado', 1, 14990),
    (3, 10436, 3, 'Bufanda de lana merino', 1, 14990),
    (4, 10441, 1, 'Polerón bordado Osorno', 1, 19990),
    (5, 10447, 1, 'Polerón bordado Osorno', 1, 19990),
    (6, 10447, 2, 'Gorro de lana chilota', 1, 9990),
    (7, 10452, 2, 'Gorro de lana chilota', 1, 9990),
    (8, 10452, 3, 'Bufanda de lana merino', 1, 14990),
    (9, 10455, 9, 'Miel de ulmo 500 g', 1, 6500),
    (10, 10455, 10, 'Mermelada de murta 250 g', 1, 3990),
    (11, 10458, 1, 'Polerón bordado Osorno', 2, 19990),
    (12, 10200, 1, 'Polerón bordado Osorno', 1, 24990),
    (13, 10200, 2, 'Gorro de lana chilota', 1, 9990),
    (14, 10201, 3, 'Bufanda de lana merino', 1, 14990),
    (15, 10202, 2, 'Gorro de lana chilota', 2, 9990),
    (16, 10203, 1, 'Polerón bordado Osorno', 1, 24990),
    (17, 10204, 9, 'Miel de ulmo 500 g', 2, 6500),
    (18, 10204, 10, 'Mermelada de murta 250 g', 1, 3990),
    (19, 10205, 5, 'Taller de bordado a mano', 1, 18000),
    (20, 10206, 4, 'Polerón infantil bordado', 1, 14990),
    (21, 10206, 2, 'Gorro de lana chilota', 1, 9990),
    (22, 10207, 7, 'Tabla de raulí para picoteo', 1, 18990),
    (23, 10208, 1, 'Polerón bordado Osorno', 2, 24990),
    (24, 10209, 14, 'Taza de greda artesanal', 2, 8990),
    (25, 10210, 3, 'Bufanda de lana merino', 1, 14990),
    (26, 10210, 2, 'Gorro de lana chilota', 1, 9990),
    (27, 10211, 11, 'Pack de miel y mermeladas', 1, 16990),
    (28, 10212, 1, 'Polerón bordado Osorno', 1, 24990),
    (29, 10212, 3, 'Bufanda de lana merino', 1, 14990),
    (30, 10213, 2, 'Gorro de lana chilota', 1, 9990),
    (31, 10214, 9, 'Miel de ulmo 500 g', 1, 6500),
    (32, 10215, 1, 'Polerón bordado Osorno', 1, 24990),
    (33, 10216, 5, 'Taller de bordado a mano', 2, 18000),
    (34, 10217, 15, 'Set de platos de greda', 1, 29990),
    (35, 10218, 1, 'Polerón bordado Osorno', 1, 24990),
    (36, 10218, 4, 'Polerón infantil bordado', 1, 14990),
    (37, 10219, 3, 'Bufanda de lana merino', 2, 14990),
    (38, 10220, 7, 'Tabla de raulí para picoteo', 1, 18990),
    (39, 10221, 1, 'Polerón bordado Osorno', 2, 24990),
    (40, 10221, 2, 'Gorro de lana chilota', 1, 9990),
    (41, 10222, 10, 'Mermelada de murta 250 g', 2, 3990),
    (42, 10223, 2, 'Gorro de lana chilota', 1, 9990);

INSERT INTO pregunta (id, producto_id, cliente_id, texto, fecha, respuesta, fecha_respuesta) VALUES
    (1, 1, 9, '¿Tienen talla XXL?', '2026-10-05', 'Por ahora llegamos hasta la XL, pero podemos hacer una XXL por encargo.', '2026-10-05'),
    (2, 1, 10, '¿Hacen envíos a Castro?', '2026-10-15', '', NULL),
    (3, 3, 11, '¿La lana pica? Es para regalo.', '2026-10-16', '', NULL),
    (4, 9, 1, '¿La miel es cruda o pasteurizada?', '2026-10-02', 'Es cruda, sin pasteurizar. Por eso puede cristalizar con el frío.', '2026-10-03');

INSERT INTO cotizacion (id, cliente_id, vendedor_id, fecha, mensaje, estado, respuesta_total, respuesta_comentario, respuesta_fecha, vigencia) VALUES
    (1, 1, 2, CURRENT_DATE - 6, 'Necesito 20 polerones para el aniversario de mi oficina, con entrega antes de diciembre.', 'Respondida', 350000, 'Incluye bordado del logo de la empresa. Entrega en 3 semanas.', CURRENT_DATE - 4, CURRENT_DATE + 11),
    (2, 1, 5, CURRENT_DATE - 3, 'Queremos la clase para un grupo de 12 personas un sábado de noviembre.', 'Pendiente', NULL, '', NULL, NULL),
    (3, 9, 2, CURRENT_DATE - 2, '¿Qué precio me dan por 10 gorros y 10 bufandas para regalos de fin de año?', 'Pendiente', NULL, '', NULL, NULL),
    (4, 1, 2, CURRENT_DATE - 30, '¿Me hacen precio por 5 gorros para mis sobrinos?', 'Respondida', 45000, 'Te dejo cada gorro a $9.000.', CURRENT_DATE - 26, CURRENT_DATE - 11);

INSERT INTO detalle_cotizacion (id, cotizacion_id, producto_id, nombre, cantidad, precio) VALUES
    (1, 1, 1, 'Polerón bordado Osorno', 20, 17500),
    (2, 2, 12, 'Clase de cerveza artesanal', 12, NULL),
    (3, 3, 2, 'Gorro de lana chilota', 10, NULL),
    (4, 3, 3, 'Bufanda de lana merino', 10, NULL),
    (5, 4, 2, 'Gorro de lana chilota', 5, 9000);

INSERT INTO calificacion (id, venta_id, producto_id, vendedor_id, cliente_id, nota_producto, nota_vendedor, comentario, fecha) VALUES
    (1, 10452, 2, 2, 11, 5, 5, 'Muy abrigador y llegó rápido a Puerto Montt.', '2026-10-14'),
    (2, 10412, 14, 7, 1, 5, 4, 'Las tazas son preciosas, una venía con un detalle mínimo en la pintura.', '2026-10-01'),
    (3, 10200, 1, 2, 8, 5, 5, 'Me encantó el bordado, se nota el trabajo a mano.', '2026-05-11'),
    (4, 10203, 1, 2, 9, 5, 5, 'Llegó súper bien envuelto y antes de lo esperado.', '2026-06-09'),
    (5, 10208, 1, 2, 10, 4, 5, 'Muy lindo, la talla venía un poco grande.', '2026-07-08'),
    (6, 10212, 1, 2, 9, 5, 4, 'Buena calidad, lo volvería a comprar.', '2026-07-28'),
    (7, 10215, 1, 2, 8, 3, 4, 'Bonito, pero el color era más claro que en la foto.', '2026-08-19'),
    (8, 10221, 1, 2, 12, 5, 5, 'Excelente atención por mensaje y buen producto.', '2026-09-18');

INSERT INTO devolucion (id, venta_id, cliente_id, vendedor_id, producto_id, nombre_producto, cantidad, motivo, detalle, fecha, estado, respuesta, monto) VALUES
    (1, 10436, 8, 2, 3, 'Bufanda de lana merino', 1, 'Llegó con un defecto', 'La bufanda trae un hilo suelto en una de las puntas.', '2026-10-08', 'Pendiente', '', 14990);

INSERT INTO mensaje (id, cliente_id, vendedor_id, autor_id, texto, fecha) VALUES
    (1, 1, 2, 1, 'Hola, ¿el polerón bordado viene en color verde?', '2026-10-13 10:15'),
    (2, 1, 2, 2, 'Hola Camila, por ahora solo gris, azul marino y negro.', '2026-10-13 10:40'),
    (3, 1, 2, 1, 'Perfecto, entonces compro dos en gris.', '2026-10-13 11:02'),
    (4, 1, 4, 1, '¿La miel de ulmo la tienen en frasco de 1 kg?', '2026-10-16 18:20');

INSERT INTO notificacion (id, usuario_id, texto, fecha, leida, ruta) VALUES
    (1, 1, 'Tu pedido 10458 fue enviado con Starken.', '2026-10-15', FALSE, '/tienda/compras/10458'),
    (2, 1, 'Darnell Bros respondió tu cotización.', '2026-10-12', FALSE, '/tienda/cotizaciones'),
    (3, 1, 'Nueva oferta: Set de platos de greda a $25.490.', '2026-10-10', TRUE, '/tienda/producto/15'),
    (4, 2, 'Fernanda Vidal te pidió una cotización.', '2026-10-16', FALSE, '/mi-tienda/cotizaciones'),
    (5, 2, 'Tienes una pregunta nueva en Bufanda de lana merino.', '2026-10-16', FALSE, '/mi-tienda/preguntas'),
    (6, 2, 'Matías Soto pidió la devolución de una compra.', '2026-10-08', TRUE, '/mi-tienda/devoluciones');

SELECT setval(pg_get_serial_sequence('compania', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM compania;

SELECT setval(pg_get_serial_sequence('usuario', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM usuario;

SELECT setval(pg_get_serial_sequence('direccion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM direccion;

SELECT setval(pg_get_serial_sequence('telefono', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM telefono;

SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM categoria;

SELECT setval(pg_get_serial_sequence('correo_adicional', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM correo_adicional;

SELECT setval(pg_get_serial_sequence('variante', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM variante;

SELECT setval(pg_get_serial_sequence('foto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM foto;

SELECT setval(pg_get_serial_sequence('producto_relacionado', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM producto_relacionado;

SELECT setval(pg_get_serial_sequence('producto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM producto;

SELECT setval(pg_get_serial_sequence('oferta', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM oferta;

SELECT setval(pg_get_serial_sequence('costo_envio', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM costo_envio;

SELECT setval(pg_get_serial_sequence('venta', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venta;

SELECT setval(pg_get_serial_sequence('detalle_venta', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM detalle_venta;

SELECT setval(pg_get_serial_sequence('pregunta', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM pregunta;

SELECT setval(pg_get_serial_sequence('cotizacion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM cotizacion;

SELECT setval(pg_get_serial_sequence('detalle_cotizacion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM detalle_cotizacion;

SELECT setval(pg_get_serial_sequence('calificacion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM calificacion;

SELECT setval(pg_get_serial_sequence('devolucion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM devolucion;

SELECT setval(pg_get_serial_sequence('mensaje', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM mensaje;

SELECT setval(pg_get_serial_sequence('notificacion', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM notificacion;
