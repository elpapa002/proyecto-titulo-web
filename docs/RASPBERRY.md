# Instalación en la Raspberry Pi

La Raspberry aloja la base de datos, el backend y la página. Al final todo queda en `http://IP_RASPBERRY:5000`. Si el archivo de configuración del profesor indica otros valores (usuario, IP, puertos), se usan esos.

Se puede hacer en una Raspberry de verdad o en una máquina virtual de VirtualBox con Raspberry Pi OS. Los pasos 3 en adelante son iguales en los dos casos.

## 1. Opción A: Raspberry física

1. Con Raspberry Pi Imager grabar **Raspberry Pi OS de 64 bits** en la microSD (sirve la versión Lite o la con escritorio).
2. En las opciones del Imager dejar listo el nombre del equipo (`compraventa`), el usuario, la clave, la red wifi y activar SSH.
3. Encender la Raspberry y conectarse desde el computador: `ssh usuario@compraventa.local`.

## 2. Opción B: máquina virtual en VirtualBox

1. Descargar la imagen **amd64** de Raspberry Pi Desktop (Raspberry Pi OS para PC), la que se usa en el video de instalación. Es un archivo `.iso`.
2. En VirtualBox, Nueva máquina: tipo Linux, versión Debian (64-bit), 2 GB de RAM o más, 2 procesadores y un disco de 20 GB.
3. En Configuración, Almacenamiento, poner el `.iso` en la unidad óptica y arrancar. Elegir instalar en el disco (Graphical install) y seguir los pasos.
4. En Configuración, Red, cambiar el adaptador a **Adaptador puente** (bridged). Así la máquina virtual recibe una IP de la misma red y se puede abrir la página desde el celular u otro computador. Con NAT solo funciona dentro de la misma máquina virtual.
5. Abrir la terminal dentro de la máquina virtual.

Importante: el backend usa .NET 8, que necesita un sistema de 64 bits. Las imágenes de 32 bits (i386 o armhf) no sirven; el script avisa si se intenta.

## 3. Red

1. Ver la IP: `hostname -I`.
2. En la Raspberry física conviene dejar la IP fija (cambiar la conexión, la IP y la puerta de enlace por las de la red del grupo):

```bash
sudo nmcli con mod "preconfigured" ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1 ipv4.dns 8.8.8.8 ipv4.method manual
sudo nmcli con up "preconfigured"
```

3. Probar desde otro computador de la misma red: `ping IP_RASPBERRY`.

## 4. Instalar todo con el script

```bash
sudo apt update && sudo apt install -y git
git clone https://github.com/elpapa002/proyecto-titulo-web
cd proyecto-titulo-web
bash raspberry/instalar.sh
```

El script pide la clave que va a tener el usuario `compraventa_app` de PostgreSQL (se escribe sin que se vea) y hace lo siguiente:

1. Instala PostgreSQL, curl, git y las librerías que necesita .NET.
2. Revisa que Node.js sea 20.19 o más nuevo (lo pide Vite) y si no, lo instala.
3. Crea el usuario `compraventa_app` y la base `compraventa`, y carga `database/01_tablas.sql` y `database/02_datos.sql` solo si la base está vacía.
4. Instala el SDK de .NET 8 en `~/.dotnet`.
5. Compila el frontend apuntando a la API del mismo servidor.
6. Publica el backend en `/opt/compraventa/api`, copia ahí la página compilada y crea el `.env` con la conexión a la base (solo lo puede leer el usuario que instaló).
7. Crea el servicio `compraventa` para que parta solo al prender la Raspberry, y si el firewall está activo abre el puerto 5000.

Al terminar muestra la dirección, por ejemplo `http://192.168.1.50:5000`.

## 5. Probar

1. Desde otro equipo de la red abrir `http://IP_RASPBERRY:5000` y entrar con un usuario de prueba (clave `Clave2026`).
2. En el navegador, `http://IP_RASPBERRY:5000/api/categorias` muestra las categorías en JSON. Las demás rutas piden iniciar sesión, por eso sin token responden 401.
3. En Postman importar `backend/postman/CompraVenta.postman_collection.json` y cambiar `baseUrl` por `http://IP_RASPBERRY:5000`. La colección se corre sobre la base recién cargada.

## 6. Actualizar después de un cambio

```bash
cd proyecto-titulo-web
git pull
bash raspberry/instalar.sh
```

Los datos de la base se mantienen. Para volver a cargar los datos de ejemplo desde cero:

```bash
REINICIAR_DATOS=si bash raspberry/instalar.sh
```

Si la base es de una versión anterior (por ejemplo, sin las tablas del Avance 3 de variantes, fotos, correos y configuración de envío), el script lo detecta y vuelve a cargar las tablas y los datos de prueba.

## 7. Comandos útiles

1. Ver si el servicio está corriendo: `sudo systemctl status compraventa`.
2. Ver los errores del backend: `sudo journalctl -u compraventa -n 50`.
3. Reiniciar el backend: `sudo systemctl restart compraventa`.
4. Entrar a la base: `psql -h localhost -U compraventa_app -d compraventa`.

## 8. Usar la Raspberry desde el frontend del computador

Si alguien quiere seguir programando el frontend en su computador pero con los datos de la Raspberry, crea el archivo `.env` en la raíz del proyecto:

```
VITE_API_URL=http://IP_RASPBERRY:5000/api
VITE_USAR_BACKEND=true
```

y ejecuta `npm run dev`.

## Lista de verificación

1. `uname -m` muestra `aarch64` (Raspberry) o `x86_64` (VirtualBox).
2. `sudo systemctl status postgresql` aparece activo.
3. `psql -h localhost -U compraventa_app -d compraventa -c "SELECT COUNT(*) FROM usuario;"` devuelve los usuarios de prueba.
4. `sudo systemctl status compraventa` aparece activo.
5. `http://IP_RASPBERRY:5000/api/categorias` responde desde otro equipo de la red.
6. La página inicia sesión y muestra los productos, los reportes y descarga el PDF.

## Problemas comunes

1. "necesita un sistema de 64 bits" o "Unsupported architecture: armhf": se instaló Raspberry Pi OS de 32 bits. Se revisa con `dpkg --print-architecture` (tiene que decir `arm64`). Hay que volver a grabar la tarjeta con Raspberry Pi Imager eligiendo Raspberry Pi OS (64-bit), o usar la imagen amd64 en VirtualBox.
2. La página abre en la máquina virtual pero no desde el celular: la red de VirtualBox está en NAT, cambiarla a Adaptador puente y reiniciar la máquina virtual.
3. "El servicio no respondió": revisar el error con `sudo journalctl -u compraventa -n 50`. Si dice que no puede conectarse a la base, volver a correr el script con la clave correcta.
