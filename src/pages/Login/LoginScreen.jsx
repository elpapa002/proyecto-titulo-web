import { Navigate, useLocation } from "react-router-dom";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import useUser from "../../contexts/UserContext/useUser";
import { rutaInicio } from "../../utils/roles";

const LoginScreen = () => {
  const { usuario, sesionVigente } = useUser();
  const location = useLocation();

  if (sesionVigente()) return <Navigate to={location.state?.desde ?? rutaInicio(usuario)} replace />;

  return <LoginTemplate mensajeInicial={location.state?.mensaje} />;
};

export default LoginScreen;
