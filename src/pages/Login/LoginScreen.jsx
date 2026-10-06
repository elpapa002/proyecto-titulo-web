import { Navigate, useLocation } from "react-router-dom";
import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import useUser from "../../contexts/UserContext/useUser";

const LoginScreen = () => {
  const { sesionVigente } = useUser();
  const location = useLocation();

  if (sesionVigente()) return <Navigate to={location.state?.desde ?? "/resumen"} replace />;

  return <LoginTemplate mensajeInicial={location.state?.mensaje} />;
};

export default LoginScreen;
