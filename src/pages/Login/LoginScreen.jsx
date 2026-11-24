import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import useUser from "../../contexts/UserContext/useUser";
import { rutaInicio } from "../../utils/roles";
import { AVISO_SESION } from "../../services/api";

const leerAviso = () => {
  try {
    return sessionStorage.getItem(AVISO_SESION) ?? "";
  } catch {
    return "";
  }
};

const LoginScreen = () => {
  const { usuario, sesionVigente } = useUser();
  const location = useLocation();
  const [avisoSesion] = useState(leerAviso);

  // el aviso de sesion vencida se muestra una sola vez
  useEffect(() => {
    try {
      sessionStorage.removeItem(AVISO_SESION);
    } catch {
      // nada que borrar
    }
  }, []);

  if (sesionVigente()) return <Navigate to={location.state?.desde ?? rutaInicio(usuario)} replace />;

  return <LoginTemplate mensajeInicial={location.state?.mensaje ?? avisoSesion} />;
};

export default LoginScreen;
