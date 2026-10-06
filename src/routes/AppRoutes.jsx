import { Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "../pages/Login/LoginScreen";
import RegisterScreen from "../pages/Register/RegisterScreen";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
