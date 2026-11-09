# Backend Compra y Venta

API REST hecha en ASP.NET Core (.NET 8) con Entity Framework Core y PostgreSQL, siguiendo la clase de backend del ramo.

## Estructura

1. `Controllers/`: los endpoints, uno por recurso.
2. `Models/`: las entidades, mapeadas a las tablas de `database/01_tablas.sql`.
3. `DTOs/`: lo que se recibe y lo que se devuelve. Ningún DTO de respuesta trae el hash de la clave.
4. `Data/AppDbContext.cs`: la conexión a PostgreSQL.
5. `Utilidades/`: validación de RUN, formatos y armado de las respuestas.
6. `Program.cs`: controladores, CORS, conexión y manejo de errores.

Todas las respuestas tienen la forma `{ "success", "message", "data", "errors" }` y usan los códigos 200, 201, 204, 400, 401, 404, 409 y 500.

## Cómo correrlo

1. Tener instalado el SDK de .NET 8 y PostgreSQL 16.
2. Crear la base y cargar los datos como dice `database/README.md`.
3. En `backend/CompraVenta.Api`, copiar `appsettings.json` como `appsettings.Development.json` y poner la clave real de PostgreSQL en `ConnectionStrings:Default`. Ese archivo no se sube a GitHub.
4. Ejecutar:

```bash
cd backend/CompraVenta.Api
dotnet restore
dotnet run
```

5. La API queda en `http://localhost:5000/api` (en la Raspberry, `http://IP_RASPBERRY:5000/api`).
6. Para que el frontend use el backend, crear un archivo `.env` en la raíz del proyecto React con:

```
VITE_API_URL=http://localhost:5000/api
VITE_USAR_BACKEND=true
```

y volver a ejecutar `npm run dev`. Con `VITE_USAR_BACKEND=false` el frontend sigue funcionando con los datos de prueba.

## Contraseñas

1. En el registro la clave llega al backend y se guarda con `BCrypt.Net.BCrypt.HashPassword` en la columna `clave_hash`.
2. En el inicio de sesión se compara con `BCrypt.Net.BCrypt.Verify`. Si el RUN no existe o la clave no coincide responde 401.
3. El cambio de clave verifica la clave actual con bcrypt antes de guardar la nueva.
4. La clave nunca se devuelve ni se escribe en consola. En el frontend los `console.log` la muestran como `********`.

Usuarios de prueba (clave `Clave2026`): cliente 20.456.789-1, emprendedor 16.903.557-1, administrador 11.111.111-1.

## Pruebas con Postman

Importar `backend/postman/CompraVenta.postman_collection.json`. La variable `baseUrl` se cambia por `http://localhost:5000` o por la IP de la Raspberry. Cada grupo de endpoints tiene un caso exitoso y casos de error (400, 401, 404, 409).

## Endpoints

1. Sesión: `POST /api/login`, `POST /api/usuarios/registro`.
2. Usuarios: `GET /api/usuarios`, `GET /api/usuarios/{id}`, `POST /api/usuarios`, `PUT /api/usuarios/{id}`, `DELETE /api/usuarios/{id}`, `PUT /api/usuarios/{id}/clave`.
3. Compañías: `GET /api/companias`, `GET /api/companias/{id}`, `POST /api/companias`, `PUT /api/companias/{id}`, `DELETE /api/companias/{id}`.
4. Categorías: `GET /api/categorias`, `POST /api/categorias`, `PUT /api/categorias/{id}`, `DELETE /api/categorias/{id}`.
5. Productos y servicios: `GET /api/productos`, `GET /api/productos/{id}`, `GET /api/productos/{id}/relacionados`, `GET /api/vendedores/{id}/productos`, `POST /api/productos`, `PUT /api/productos/{id}`, `DELETE /api/productos/{id}`.
6. Ofertas: `GET /api/vendedores/{id}/ofertas`, `POST /api/ofertas`, `PUT /api/ofertas/{id}`, `DELETE /api/ofertas/{id}`.
7. Costos de envío: `GET /api/vendedores/{id}/envios`, `GET /api/vendedores/{id}/envios/{comuna}`, `POST /api/envios`, `PUT /api/envios/{id}`, `DELETE /api/envios/{id}`.
8. Direcciones: `GET /api/usuarios/{id}/direcciones`, `POST /api/direcciones`, `PUT /api/direcciones/{id}`, `DELETE /api/direcciones/{id}`.
9. Teléfonos: `GET /api/usuarios/{id}/telefonos`, `POST /api/telefonos`, `PUT /api/telefonos/{id}`, `DELETE /api/telefonos/{id}`.
10. Ventas: `GET /api/clientes/{id}/compras`, `GET /api/vendedores/{id}/ventas`, `GET /api/ventas/{id}`, `POST /api/ventas`, `PUT /api/ventas/{id}`.
11. Preguntas: `GET /api/productos/{id}/preguntas`, `GET /api/vendedores/{id}/preguntas`, `POST /api/productos/{id}/preguntas`, `PUT /api/preguntas/{id}`, `DELETE /api/preguntas/{id}`.
12. Cotizaciones: `GET /api/clientes/{id}/cotizaciones`, `GET /api/vendedores/{id}/cotizaciones`, `POST /api/cotizaciones`, `PUT /api/cotizaciones/{id}/respuesta`, `PUT /api/cotizaciones/{id}/estado`, `DELETE /api/cotizaciones/{id}`.
13. Calificaciones: `GET /api/productos/{id}/calificaciones`, `POST /api/calificaciones`.
14. Devoluciones: `GET /api/clientes/{id}/devoluciones`, `GET /api/vendedores/{id}/devoluciones`, `POST /api/devoluciones`, `PUT /api/devoluciones/{id}`.
15. Mensajes: `GET /api/usuarios/{id}/conversaciones`, `GET /api/conversaciones/{clienteId}/{vendedorId}`, `POST /api/mensajes`.
16. Avisos: `GET /api/usuarios/{id}/notificaciones`, `PUT /api/usuarios/{id}/notificaciones`, `PUT /api/notificaciones/{id}`, `DELETE /api/notificaciones/{id}`.
