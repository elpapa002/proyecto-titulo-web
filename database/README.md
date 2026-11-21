# Base de datos

Scripts de PostgreSQL (probados en la versión 16) para el proyecto Compra y Venta.

1. `01_tablas.sql` borra (si existen) y crea las 17 tablas con sus llaves, CHECK y UNIQUE.
2. `02_datos.sql` carga los mismos datos de ejemplo que usa el frontend en `src/services/datosPrueba.js`, con los mismos id. Incluye ventas desde mayo de 2026 para que los reportes tengan datos. Las ofertas y cotizaciones usan fechas relativas a `CURRENT_DATE`, así siguen vigentes cuando se carga la base otro día. Al final ajusta las secuencias para que los próximos registros sigan desde el último id.

## Cómo cargarla

1. Entrar a PostgreSQL como administrador y crear el usuario y la base del proyecto:

```sql
CREATE USER compraventa_app WITH PASSWORD 'una_clave_segura';
CREATE DATABASE compraventa OWNER compraventa_app;
```

2. Desde esta carpeta, ejecutar los dos scripts con ese usuario:

```bash
psql -h localhost -U compraventa_app -d compraventa -f 01_tablas.sql
psql -h localhost -U compraventa_app -d compraventa -f 02_datos.sql
```

3. Revisar que quedaron los datos:

```bash
psql -h localhost -U compraventa_app -d compraventa -c "SELECT id, run, nombres FROM usuario;"
```

## Usuarios de ejemplo

Todos tienen la clave `Clave2026`. En `clave_hash` está guardado el bcrypt del valor que manda el frontend (la clave ya cifrada con la sal del RUN), nunca la clave en texto plano.

1. Cliente: RUN 20.456.789-1
2. Emprendedor: RUN 16.903.557-1
3. Administrador: RUN 11.111.111-1

Para volver a dejar la base como al principio basta con ejecutar otra vez los dos scripts. En la Raspberry también se puede con `REINICIAR_DATOS=si bash raspberry/instalar.sh`.
