#!/bin/bash
set -e

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DESTINO=/opt/compraventa
USUARIO="$(whoami)"
DOTNET="$HOME/.dotnet/dotnet"

echo "== Instalación de Compra y Venta =="

# se revisa el sistema y no solo el procesador: Raspberry Pi OS de 32 bits puede correr
# sobre un procesador de 64 bits y ahi .NET 8 y Node 22 no se instalan
ARQUITECTURA="$(dpkg --print-architecture 2> /dev/null || uname -m)"
case "$ARQUITECTURA" in
  arm64|amd64|aarch64|x86_64) ;;
  *)
    echo "Este sistema es de 32 bits ($ARQUITECTURA). El backend en .NET 8 y el frontend necesitan un sistema de 64 bits."
    echo "En la Raspberry graba de nuevo la tarjeta con Raspberry Pi Imager eligiendo Raspberry Pi OS (64-bit)."
    echo "En VirtualBox usa la imagen amd64."
    exit 1
    ;;
esac

if [ -z "$CLAVE_BD" ]; then
  read -r -s -p "Clave que tendrá el usuario compraventa_app en PostgreSQL: " CLAVE_BD
  echo
fi
if [ -z "$CLAVE_BD" ] || ! [[ "$CLAVE_BD" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "La clave no puede quedar vacía y solo puede tener letras, números, punto, guion o guion bajo."
  exit 1
fi

echo "1/7 Instalando paquetes del sistema"
sudo apt-get update
sudo apt-get install -y postgresql curl git ca-certificates libicu-dev

echo "2/7 Revisando Node.js"
version_ok() {
  command -v node > /dev/null && node -e '
    const [a, b] = process.versions.node.split(".").map(Number);
    process.exit((a === 20 && b >= 19) || (a === 22 && b >= 12) || a > 22 ? 0 : 1);
  '
}
if ! version_ok; then
  sudo apt-get install -y nodejs npm || true
fi
if ! version_ok; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node $(node -v)"

echo "3/7 Preparando la base de datos"
sudo systemctl enable --now postgresql
sudo -u postgres psql -q -v ON_ERROR_STOP=1 -v clave="$CLAVE_BD" <<'SQL'
SELECT format('CREATE ROLE compraventa_app LOGIN PASSWORD %L', :'clave')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'compraventa_app')\gexec
SELECT format('ALTER ROLE compraventa_app LOGIN PASSWORD %L', :'clave')\gexec
SELECT 'CREATE DATABASE compraventa OWNER compraventa_app'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'compraventa')\gexec
SQL

export PGPASSWORD="$CLAVE_BD"
BD="psql -h localhost -U compraventa_app -d compraventa -q -v ON_ERROR_STOP=1"
TABLAS="$($BD -tAc "SELECT to_regclass('public.usuario')")"
# si la base es de una version anterior (le faltan las tablas del Avance 3) se vuelve a cargar
NUEVAS="$($BD -tAc "SELECT to_regclass('public.variante') IS NOT NULL AND to_regclass('public.correo_adicional') IS NOT NULL")"
if [ -n "$TABLAS" ] && [ "$NUEVAS" != "t" ]; then
  echo "La base es de una versión anterior: se cargan de nuevo las tablas y los datos de prueba"
  REINICIAR_DATOS=si
fi
if [ "$REINICIAR_DATOS" = "si" ] || [ -z "$TABLAS" ]; then
  echo "Cargando tablas y datos de prueba"
  $BD -o /dev/null -f "$RAIZ/database/01_tablas.sql"
  $BD -o /dev/null -f "$RAIZ/database/02_datos.sql"
else
  echo "La base ya tiene datos, se mantienen (para borrarlos usa REINICIAR_DATOS=si)"
fi
unset PGPASSWORD

echo "4/7 Revisando .NET 8"
if ! "$DOTNET" --list-sdks 2> /dev/null | grep -q "^8\."; then
  curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
  bash /tmp/dotnet-install.sh --channel 8.0 --install-dir "$HOME/.dotnet"
fi
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$PATH:$HOME/.dotnet"
if ! grep -q "DOTNET_ROOT" "$HOME/.bashrc"; then
  echo "export DOTNET_ROOT=\$HOME/.dotnet" >> "$HOME/.bashrc"
  echo "export PATH=\$PATH:\$HOME/.dotnet" >> "$HOME/.bashrc"
fi
echo ".NET $("$DOTNET" --version)"

echo "5/7 Compilando el frontend"
cd "$RAIZ"
npm install --no-audit --no-fund
VITE_API_URL=/api VITE_USAR_BACKEND=true npm run build

echo "6/7 Publicando el backend"
sudo mkdir -p "$DESTINO"
sudo chown "$USUARIO" "$DESTINO"
"$DOTNET" publish "$RAIZ/backend/CompraVenta.Api/CompraVenta.Api.csproj" -c Release -o "$DESTINO/api"
rm -rf "$DESTINO/api/wwwroot"
cp -r "$RAIZ/dist" "$DESTINO/api/wwwroot"
# la clave de la base queda solo en este .env, que lee el backend al partir
SECRETO_TOKEN="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
{
  echo "ConnectionStrings__Default=Host=localhost;Port=5432;Database=compraventa;Username=compraventa_app;Password=$CLAVE_BD"
  echo "Auth__Secreto=$SECRETO_TOKEN"
} > "$DESTINO/api/.env"
chmod 600 "$DESTINO/api/.env"

echo "7/7 Dejando el servicio activo"
sudo tee /etc/systemd/system/compraventa.service > /dev/null <<SERVICIO
[Unit]
Description=Compra y Venta
After=network.target postgresql.service

[Service]
WorkingDirectory=$DESTINO/api
ExecStart=$DOTNET $DESTINO/api/CompraVenta.Api.dll
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_ROOT=$HOME/.dotnet
Restart=always
RestartSec=5
User=$USUARIO

[Install]
WantedBy=multi-user.target
SERVICIO
sudo systemctl daemon-reload
sudo systemctl enable compraventa
sudo systemctl restart compraventa

if command -v ufw > /dev/null && sudo ufw status | grep -q "Status: active"; then
  sudo ufw allow 5000/tcp
fi

echo "Esperando a que el servidor responda..."
for _ in $(seq 1 30); do
  if curl -fs http://localhost:5000/api/categorias > /dev/null; then
    IP="$(hostname -I | awk '{print $1}')"
    echo
    echo "Listo. La página quedó funcionando en:"
    echo "  http://localhost:5000      (en esta misma máquina)"
    echo "  http://$IP:5000   (desde otro computador o celular de la red)"
    echo "La API responde en http://$IP:5000/api"
    exit 0
  fi
  sleep 2
done

echo "El servicio no respondió. Revisa el error con: sudo journalctl -u compraventa -n 50"
exit 1
