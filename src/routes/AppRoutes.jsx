import { Navigate, Route, Routes } from "react-router-dom";
import LoginScreen from "../pages/Login/LoginScreen";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
