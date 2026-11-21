# Compra y Venta

Grupo 2 - Tecnologías Web y Móviles, Sección 1

## Integrantes

1. Rodolfo Bernier
2. José Cáceres
3. Joaquín Coronado
4. Nicolás Donoso
5. Carlos Fernández
6. Matías Guzmán
7. Sebastián Hernández
8. Belén Lobo

## Estructura del repositorio

1. Raíz: frontend en React + Material UI (`src/`), con Atomic Design.
2. `backend/`: API REST en ASP.NET Core (.NET 8) con Entity Framework Core. Ver `backend/README.md`.
3. `database/`: scripts de PostgreSQL con las tablas y los datos de ejemplo. Ver `database/README.md`.
4. `raspberry/instalar.sh`: deja todo funcionando en la Raspberry (o en la máquina virtual) con un solo comando.
5. `docs/RASPBERRY.md`: pasos de la Raspberry y de VirtualBox.
6. Minutas de las reuniones en la raíz.

## Cómo ejecutarlo

Hay tres formas, según lo que se quiera probar.

1. Solo el frontend, con datos de prueba: `npm install`, `npm run dev` y abrir http://localhost:5173. Sin archivo `.env` se usan los datos de `src/services/datosPrueba.js` y se entra con cualquier clave.
2. Frontend y backend en el mismo computador: levantar el backend como dice `backend/README.md`, copiar `.env.example` como `.env` en la raíz, dejar `VITE_USAR_BACKEND=true` y correr `npm run dev`.
3. Todo en la Raspberry: clonar el repositorio en la Raspberry y ejecutar `bash raspberry/instalar.sh`. La página y la API quedan en `http://IP_RASPBERRY:5000`. Ver `docs/RASPBERRY.md`.

## Usuarios de ejemplo

En el login están los botones "Recorrer el prototipo como". Con el backend la clave de todos es `Clave2026`.

1. Cliente: Camila Rojas, RUN 20.456.789-1
2. Emprendedor: Diego Fuentes (Darnell Bros), RUN 16.903.557-1
3. Administrador: Carlos Run, RUN 11.111.111-1

## Qué incluye

1. Cliente: inicio con ofertas y categorías, búsqueda, ficha de producto y de servicio, lista de deseos, carro, despacho, pago y boleta (se puede descargar en PDF), mis compras con seguimiento, calificar, devoluciones, cotizaciones, mensajes, avisos y mi perfil con direcciones y teléfonos.
2. Emprendedor: resumen, publicaciones, ofertas, categorías, ventas y pedidos con despacho, cotizaciones, preguntas, devoluciones, costos de envío, reportes de ventas con descarga en PDF, mensajes y avisos.
3. Administrador: resumen de la plataforma con datos reales y descarga en PDF, catálogo, usuarios (con restablecer clave), compañías y categorías.
4. Formularios con campos obligatorios marcados con *, validación de formatos y fechas (no se aceptan fechas pasadas donde no corresponde) y `console.log` de cada envío sin mostrar contraseñas.
5. Backend con 73 endpoints, validaciones, respuestas `{ success, message, data, errors }` y contraseñas con bcrypt.

## Contraseñas

1. La clave sale del navegador ya cifrada con bcrypt (`src/utils/clave.js`), nunca en texto plano.
2. El backend solo acepta claves cifradas y las vuelve a cifrar con bcrypt antes de guardarlas.
3. La conexión a la base (con su clave) va en un archivo `.env` que no se sube a GitHub.

## Pruebas

1. Postman: `backend/postman/CompraVenta.postman_collection.json`, con casos de éxito y de error para cada grupo de endpoints.
2. Para dejar la base como al principio se vuelven a ejecutar los scripts de `database/`.

## Commits

Trabajamos todos en la rama main. Antes de empezar se hace git pull, y cada commit lleva un mensaje corto con lo que se hizo, por ejemplo "Pantalla de login".
