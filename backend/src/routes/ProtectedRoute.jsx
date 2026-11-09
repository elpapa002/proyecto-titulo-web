import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUser from "../contexts/UserContext/useUser";

const ProtectedRoute = () => {
  const { sesionVigente, salidaManual } = useUser();
  const location = useLocation();

  if (!sesionVigente()) {
    return <Navigate to="/login" replace state={salidaManual ? null : { desde: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
