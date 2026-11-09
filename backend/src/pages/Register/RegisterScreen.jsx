import { Navigate } from "react-router-dom";
import RegisterTemplate from "../../components/templates/RegisterTemplate/RegisterTemplate";
import useUser from "../../contexts/UserContext/useUser";

const RegisterScreen = () => {
  const { sesionVigente } = useUser();

  if (sesionVigente()) return <Navigate to="/resumen" replace />;

  return <RegisterTemplate />;
};

export default RegisterScreen;
