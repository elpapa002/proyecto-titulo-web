import { Navigate, Outlet } from "react-router-dom";
import useUser from "../contexts/UserContext/useUser";
import { rutaInicio, tieneRol } from "../utils/roles";

const RoleRoute = ({ roles }) => {
  const { usuario } = useUser();

  if (!tieneRol(usuario, roles)) {
    return <Navigate to={rutaInicio(usuario)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
