import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import {
  actualizarSesionGuardada,
  borrarSesion,
  calcularExpiracion,
  guardarSesion,
  leerSesion,
} from "../../utils/sesion";

export const UserProvider = ({ children }) => {
  const [sesion, setSesion] = useState(leerSesion);
  const [salidaManual, setSalidaManual] = useState(false);

  useEffect(() => {
    if (!sesion) return;
    const temporizador = setTimeout(() => {
      borrarSesion();
      setSesion(null);
    }, sesion.expira - Date.now());
    return () => clearTimeout(temporizador);
  }, [sesion]);

  const iniciarSesion = (usuario, token, recordar) => {
    const nueva = { token, usuario, expira: calcularExpiracion(recordar) };
    guardarSesion(nueva, recordar);
    setSesion(nueva);
    setSalidaManual(false);
  };

  const cerrarSesion = () => {
    borrarSesion();
    setSesion(null);
    setSalidaManual(true);
  };

  const actualizarUsuarioSesion = (cambios) => {
    setSesion((actual) => {
      if (!actual) return actual;
      const nueva = { ...actual, usuario: { ...actual.usuario, ...cambios } };
      actualizarSesionGuardada(nueva);
      return nueva;
    });
  };

  const sesionVigente = () => Boolean(sesion?.token) && Date.now() <= sesion.expira;

  const valor = {
    usuario: sesion?.usuario ?? null,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuarioSesion,
    sesionVigente,
    salidaManual,
  };

  return <UserContext.Provider value={valor}>{children}</UserContext.Provider>;
};
