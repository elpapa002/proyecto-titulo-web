import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUser from "../contexts/UserContext/useUser";

const ProtectedRoute = () => {
  const { sesionVigente } = useUser();
  const location = useLocation();

  if (!sesionVigente()) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
