# Backend Compra y Venta

API REST hecha en ASP.NET Core (.NET 8) con Entity Framework Core y PostgreSQL, siguiendo la clase de backend del ramo.

## Estructura

1. `Controllers/`: los endpoints, uno por recurso.
2. `Models/`: las entidades, mapeadas a las tablas de `database/01_tablas.sql`.
3. `DTOs/`: lo que se recibe y lo que se devuelve. Ningún DTO de respuesta trae el hash de la clave.
4. `Data/AppDbContext.cs`: la conexión a PostgreSQL.
5. `Migrations/`: migraciones de Entity Framework. `InicioBase` crea las 17 tablas del Avance 2 y `Avance3` agrega las de variantes, fotos, relacionados, configuración de envío y correos. Dejan la misma base que `database/01_tablas.sql`.
6. `Utilidades/`: validación de RUN, formatos, claves (`Claves.cs`), tokens de sesión (`Tokens.cs`), permisos por persona (`Permisos.cs`) y armado de las respuestas.
7. `Program.cs`: lectura del `.env`, controladores, CORS, conexión, revisión del token en cada llamada, manejo de errores y la página del frontend (carpeta `wwwroot`).

Todas las respuestas tienen la forma `{ "success", "message", "data", "errors" }` y usan los códigos 200, 201, 400, 401, 403, 404, 409 y 500. Al eliminar se responde 200 con un mensaje, igual que en la API de ejemplo del profe.

## Cómo correrlo

1. Tener instalado el SDK de .NET 8 y PostgreSQL (16 o más nuevo). Si el computador solo tiene .NET 10 u 11, igual corre, porque el proyecto tiene `RollForward` en el `.csproj`.
2. Crear la base y cargar los datos como dice `database/README.md`.
3. En `backend/CompraVenta.Api`, copiar `.env.example` como `.env`, poner la clave real de PostgreSQL y, si se quiere, una frase en `Auth__Secreto` (sin ella las sesiones se cierran cada vez que se reinicia el backend). El `.env` no se sube a GitHub (está en el `.gitignore`), así la clave no queda en el repositorio. `appsettings.Example.json` muestra los mismos datos en formato json.
4. Si la base está vacía, las tablas también se pueden crear con las migraciones: `dotnet run -- migrar`. Después se cargan los datos de prueba con `database/02_datos.sql`.
5. Ejecutar:

```bash
cd backend/CompraVenta.Api
dotnet restore
dotnet run
```

6. La API queda en `http://localhost:5000` (en la Raspberry, `http://IP_RASPBERRY:5000`). Al abrir `http://localhost:5000/api` responde un mensaje de bienvenida con las instrucciones.
7. Para que el frontend use el backend, crear un archivo `.env` en la raíz del proyecto React con:

```
VITE_API_URL=http://localhost:5000/api
VITE_USAR_BACKEND=true
```

y volver a ejecutar `npm run dev`. Con `VITE_USAR_BACKEND=false` el frontend sigue funcionando con los datos de prueba.

8. CORS: la API acepta llamadas desde `http://localhost:5173`, `http://127.0.0.1:5173` y desde cualquier IP de red local (192.168.x.x, 10.x.x.x o 172.16 a 172.31), así funciona aunque cambie la IP del computador. Para el frontend corriendo en un computador y la API en la Raspberry, en ese computador se pone `VITE_API_URL=http://IP_RASPBERRY:5000/api`. Si el frontend se abre desde otra dirección, se agrega en el `.env` del backend, por ejemplo `Cors__Origenes__2=http://192.168.100.20:5173`.

## Contraseñas

La clave nunca viaja en texto plano del frontend al backend.

1. En el frontend, antes de enviar, `src/utils/clave.js` cifra la clave con bcrypt (librería `bcryptjs`, 10 rondas). La sal sale del RUN, así el mismo usuario siempre genera el mismo valor y el backend lo puede comparar. Se usa en login, registro y cambio de clave (`authService.js` y `userService.js`).
2. El backend rechaza con 400 cualquier clave que no venga cifrada (validación `Claves.FormatoCifrado` en los DTO).
3. En el registro, ese valor cifrado se vuelve a cifrar con `BCrypt.Net.BCrypt.HashPassword` (sal aleatoria) y se guarda en `clave_hash`. En la base nunca queda la clave ni lo que mandó el frontend.
4. En el inicio de sesión se compara con `BCrypt.Net.BCrypt.Verify`. Si el RUN no existe o la clave no coincide responde 401.
5. El cambio de clave verifica la clave actual con bcrypt antes de guardar la nueva.
6. Cuando el administrador crea un usuario o le restablece la clave, el backend genera una clave temporal al azar (por ejemplo `K7PR-M2QW`). Se muestra una sola vez al administrador y la persona la cambia en Mi perfil al entrar.
7. La clave nunca se devuelve ni se escribe en consola. En el frontend los `console.log` la muestran como `********`.

Como el valor cifrado del frontend es lo que se compara, en producción igual hay que usar HTTPS para que nadie lo pueda copiar en el camino.

Usuarios de prueba (clave `Clave2026`): cliente 20.456.789-1, emprendedor 16.903.557-1, administrador 11.111.111-1.

## Sesión y permisos

Al iniciar sesión el backend entrega un token firmado con HMAC-SHA256 (`Utilidades/Tokens.cs`) que lleva el id del usuario, sus roles y la fecha de vencimiento (8 horas). El frontend lo envía en cada llamada como `Authorization: Bearer <token>` y un middleware en `Program.cs` lo revisa:

1. Sin token válido, cualquier ruta de `/api` responde 401. Las únicas rutas públicas son `GET /api` (bienvenida), `GET /api/categorias`, `GET /api/fotos/{id}` (para mostrar las fotos con `<img>`), `POST /api/login`, `POST /api/usuarios/registro` y `POST /api/usuarios/disponibilidad`. Esta última la usa la pantalla de registro para saber si un RUN, correo o RUT de empresa ya existe, sin entregar los datos de nadie.
2. Las rutas de administración responden 403 si el token no es de un Admin: lista de usuarios, reporte de plataforma, restablecer claves, crear y eliminar usuarios, crear, editar o eliminar compañías, y editar o eliminar categorías. Crear categorías lo puede hacer también un emprendedor, para cuando falta una para su producto.
3. Cada persona solo puede ver o cambiar sus propios datos (`Utilidades/Permisos.cs`): las rutas `/api/usuarios/{id}`, `/api/clientes/{id}` y `/api/vendedores/{id}` responden 403 si el id no es el del token. De un emprendedor cualquiera con sesión puede ver sus publicaciones publicadas, ofertas y costos de envío. Una conversación solo la ven el cliente y el emprendedor que participan. El administrador puede todo.
4. Además cada controlador revisa que el registro sea de quien llama (`Utilidades/Sesion.cs`): solo el dueño edita o borra su publicación, oferta, costo de envío, dirección, teléfono, correo o aviso; una venta la ven el cliente y el emprendedor, y el estado del pedido lo cambia el emprendedor; una cotización la responde el emprendedor y la acepta o rechaza el cliente; una devolución la resuelve el emprendedor. Al crear algo, el `clienteId`, `vendedorId`, `usuarioId` o `autorId` del cuerpo tiene que ser el del token. Nadie se puede dar el rol Admin a sí mismo.
5. Cuando el token vence o el backend ya no lo reconoce, el 401 viene con la cabecera `WWW-Authenticate`. Con eso el frontend cierra la sesión y vuelve al login con el aviso "Tu sesión venció". Si se escribe mal la clave actual al cambiarla, también es 401, pero sin esa cabecera, así que no se cierra la sesión.
6. El secreto de la firma va en el `.env` como `Auth__Secreto`. `raspberry/instalar.sh` lo genera solo. Si no existe, el backend crea uno al azar al partir y los tokens dejan de servir al reiniciarlo.

## Probar con Postman

Se sigue la misma idea de la API de ejemplo del profe (ApiEstudiantesPostman), pero con los datos del proyecto, que quedan guardados en PostgreSQL. Para volver a los datos de ejemplo se cargan otra vez los scripts de `database/`.

### Colección

1. Importar `backend/postman/CompraVenta.postman_collection.json`. La variable `baseUrl` viene con `http://localhost:5000`; para la Raspberry se cambia por `http://IP_RASPBERRY:5000`.
2. Antes de cada petición la colección inicia sesión sola como administrador y guarda el token en la variable `token`. Todas las peticiones lo mandan como Bearer (pestaña Authorization de la colección).
3. La primera carpeta, "Informe: login y 4 CRUDs por perfil", es la del informe técnico: login de cliente, emprendedor y administrador (cada uno guarda su token) y los CRUD completos de direcciones (cliente), publicaciones (emprendedor), compañías y usuarios (administrador), cada uno con el token de su rol y un caso de 403. Se puede correr sola y varias veces.
4. La carpeta Demostración tiene la secuencia sugerida en la API de ejemplo del profe. La última, Seguridad, muestra los casos sin token (401) y sin permiso (403).
5. Se corre en orden sobre una base recién cargada (266 peticiones y 565 pruebas, todas pasan). Las claves de los cuerpos van cifradas como lo hace el frontend y la descripción de cada petición dice la clave sin cifrar. Las fechas de las ofertas se calculan desde el día de hoy.

### Secuencia sugerida para la demostración

1. GET `http://localhost:5000/api/companias` para revisar los registros iniciales.
2. POST `http://localhost:5000/api/companias` para crear una compañía.
3. GET `http://localhost:5000/api/companias/6` para consultar el nuevo registro (se usa el id que devolvió el POST).
4. PUT `http://localhost:5000/api/companias/6` para modificar sus datos.
5. DELETE `http://localhost:5000/api/companias/6` para eliminarla.
6. GET `http://localhost:5000/api/companias/6` para observar la respuesta 404.
7. POST con datos incompletos para observar la respuesta 400.

Body para POST y PUT (Body, raw, JSON):

```json
{
  "rut": "77.888.999-4",
  "nombre": "Cecinas Llanquihue",
  "personas": 4,
  "telefono": "+56 64 255 1234",
  "correo": "ventas@cecinasllanquihue.cl",
  "sitioWeb": "",
  "direccion": "Los Carrera 1500, Osorno"
}
```

### Códigos HTTP para observar

1. `200 OK`: consulta, actualización o eliminación exitosa.
2. `201 Created`: recurso creado.
3. `400 Bad Request`: datos incompletos, formato inválido o clave sin cifrar.
4. `401 Unauthorized`: sin token, token vencido, o RUN o clave incorrectos.
5. `403 Forbidden`: con sesión, pero sin permiso para esa acción.
6. `404 Not Found`: el registro no existe.
7. `409 Conflict`: el dato ya existe o tiene registros asociados.
8. `500 Internal Server Error`: error no controlado (responde con el mismo formato, sin mostrar detalles).

### Hacer una petición a mano

1. POST `http://localhost:5000/api/login` con el RUN y la clave cifrada. Para los usuarios de ejemplo (clave `Clave2026`):
   1. Cliente: `{ "run": "20.456.789-1", "clave": "$2b$10$CompraVenta204567891..GSz/mmN8sIwKKgQJe2TKkqnQWl5TKwi" }`
   2. Emprendedor: `{ "run": "16.903.557-1", "clave": "$2b$10$CompraVenta169035571..0j98VZLvMx7jCSF3yVHG1jfQVRls/bi" }`
   3. Administrador: `{ "run": "11.111.111-1", "clave": "$2b$10$CompraVenta111111111..xkoWAlKkagiDUJ3vbsaVfhasSSWGYgG" }`
2. Copiar el `token` de la respuesta.
3. En la petición nueva, pestaña Authorization, elegir Bearer Token y pegarlo.

Si se manda `"clave": "Clave2026"` responde 400, porque el backend no acepta claves en texto plano.

## Reglas de las funciones nuevas

1. Variantes: un producto puede tener variantes de talla y/o color, cada una con su SKU, stock y precio. El stock del producto es la suma. Al comprar un producto con variantes hay que mandar `varianteId` en cada ítem; se descuenta el stock de esa variante. Si hay oferta, baja el precio de cada variante en el mismo porcentaje.
2. Fotos: hasta 4 por publicación, JPG, PNG o WEBP de hasta 2 MB, guardadas en la base (tabla `foto`). Se suben en base64 con `POST /api/productos/{id}/fotos` y se ven con `GET /api/fotos/{id}`. El backend revisa los primeros bytes del archivo, no solo el tipo que dice el navegador. La primera es la principal y lleva texto alternativo.
3. Relacionados: el emprendedor elige hasta 6 publicaciones suyas. `GET /api/productos/{id}/relacionados` muestra primero esas y completa hasta 5 con la misma subcategoría o tienda.
4. Envíos: cada emprendedor elige la forma de cálculo. Por comuna o región usa la tabla de costos; la fila "Resto de la región" cubre las comunas que no están en la lista. Según peso cobra costo base más costo por kilo adicional (2,5 kg = base + 2 × kilo) y la tabla dice a qué comunas despacha y en cuántos días. También puede permitir el retiro en su local, sin costo. El costo de envío de una venta lo calcula el backend; no se usa el que manda el navegador.
5. Correos: además del principal, cada persona puede tener hasta 5 correos adicionales (tabla `correo_adicional`). Un correo pertenece a una sola persona, sea principal o adicional. Al registrarse, el primer correo queda como principal y los demás como adicionales.
6. Cotizaciones: una cotización respondida mantiene sus valores 15 días. Si el cliente no la acepta, pasa a "Expirada", su precio se reajusta cada semana (2% por semana por defecto, se cambia con `Cotizaciones__ReajusteSemanal` en el `.env`) y se elimina a los 45 días de haber expirado. Si la acepta estando expirada, queda con el precio reajustado.

## Endpoints (84)

1. Sesión: `GET /api` (bienvenida), `POST /api/login`, `POST /api/usuarios/registro`, `POST /api/usuarios/disponibilidad`.
2. Usuarios: `GET /api/usuarios`, `GET /api/usuarios/{id}`, `POST /api/usuarios`, `PUT /api/usuarios/{id}`, `DELETE /api/usuarios/{id}`, `PUT /api/usuarios/{id}/clave`, `PUT /api/usuarios/{id}/clave/restablecer`.
3. Compañías: `GET /api/companias`, `GET /api/companias/{id}`, `POST /api/companias`, `PUT /api/companias/{id}`, `DELETE /api/companias/{id}`.
4. Categorías: `GET /api/categorias`, `POST /api/categorias`, `PUT /api/categorias/{id}`, `DELETE /api/categorias/{id}`.
5. Productos y servicios: `GET /api/productos`, `GET /api/productos/{id}`, `GET /api/productos/{id}/relacionados`, `GET /api/vendedores/{id}/productos`, `POST /api/productos`, `PUT /api/productos/{id}`, `DELETE /api/productos/{id}`.
6. Ofertas: `GET /api/vendedores/{id}/ofertas`, `POST /api/ofertas`, `PUT /api/ofertas/{id}`, `DELETE /api/ofertas/{id}`.
7. Costos de envío: `GET /api/vendedores/{id}/envios`, `GET /api/vendedores/{id}/envios/{comuna}?peso=2.5`, `GET /api/vendedores/{id}/envios/configuracion`, `PUT /api/vendedores/{id}/envios/configuracion`, `POST /api/envios`, `PUT /api/envios/{id}`, `DELETE /api/envios/{id}`.
8. Direcciones: `GET /api/usuarios/{id}/direcciones`, `POST /api/direcciones`, `PUT /api/direcciones/{id}`, `DELETE /api/direcciones/{id}`.
9. Teléfonos: `GET /api/usuarios/{id}/telefonos`, `POST /api/telefonos`, `PUT /api/telefonos/{id}`, `DELETE /api/telefonos/{id}`.
10. Correos adicionales: `GET /api/usuarios/{id}/correos`, `POST /api/correos`, `PUT /api/correos/{id}`, `DELETE /api/correos/{id}`.
11. Fotos: `GET /api/fotos/{id}`, `POST /api/productos/{id}/fotos`, `DELETE /api/fotos/{id}`.
12. Ventas: `GET /api/clientes/{id}/compras`, `GET /api/vendedores/{id}/ventas`, `GET /api/ventas/{id}`, `POST /api/ventas`, `PUT /api/ventas/{id}`.
13. Preguntas: `GET /api/productos/{id}/preguntas`, `GET /api/vendedores/{id}/preguntas`, `POST /api/productos/{id}/preguntas`, `PUT /api/preguntas/{id}`, `DELETE /api/preguntas/{id}`.
14. Cotizaciones: `GET /api/clientes/{id}/cotizaciones`, `GET /api/vendedores/{id}/cotizaciones`, `POST /api/cotizaciones`, `PUT /api/cotizaciones/{id}/respuesta`, `PUT /api/cotizaciones/{id}/estado`, `DELETE /api/cotizaciones/{id}`.
15. Calificaciones: `GET /api/productos/{id}/calificaciones`, `POST /api/calificaciones`.
16. Devoluciones: `GET /api/clientes/{id}/devoluciones`, `GET /api/vendedores/{id}/devoluciones`, `POST /api/devoluciones`, `PUT /api/devoluciones/{id}`.
17. Mensajes: `GET /api/usuarios/{id}/conversaciones`, `GET /api/conversaciones/{clienteId}/{vendedorId}`, `POST /api/mensajes`.
18. Avisos: `GET /api/usuarios/{id}/notificaciones`, `PUT /api/usuarios/{id}/notificaciones`, `PUT /api/notificaciones/{id}`, `DELETE /api/notificaciones/{id}`.
19. Reportes: `GET /api/vendedores/{id}/reportes?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (ventas, pedidos, venta promedio, calificaciones, ventas por mes y productos más vendidos) y `GET /api/reportes/plataforma?desde=...&hasta=...` (resumen del administrador). Sin fechas se toman los últimos 6 meses. Responde 400 si las fechas están al revés, son futuras o pasan de 24 meses.
