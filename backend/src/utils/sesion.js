const CLAVE_SESION = "sesion-compra-venta";
const UNA_HORA = 60 * 60 * 1000;

export const leerSesion = () => {
  try {
    const texto = localStorage.getItem(CLAVE_SESION) ?? sessionStorage.getItem(CLAVE_SESION);
    if (!texto) return null;
    const sesion = JSON.parse(texto);
    if (!sesion.token || Date.now() > sesion.expira) return null;
    return sesion;
  } catch {
    return null;
  }
};

export const borrarSesion = () => {
  try {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
    return true;
  } catch {
    return false;
  }
};

export const guardarSesion = (sesion, recordar) => {
  try {
    borrarSesion();
    const almacen = recordar ? localStorage : sessionStorage;
    almacen.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
  } catch {
    return false;
  }
};

export const actualizarSesionGuardada = (sesion) => {
  try {
    const almacen = localStorage.getItem(CLAVE_SESION) ? localStorage : sessionStorage;
    almacen.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
  } catch {
    return false;
  }
};

export const calcularExpiracion = (recordar) => Date.now() + (recordar ? 8 : 1) * UNA_HORA;
