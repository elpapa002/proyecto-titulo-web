import { Navigate, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
import ProtectedRoute from "./ProtectedRoute";
import PanelTemplate from "../components/templates/PanelTemplate/PanelTemplate";
import LoginScreen from "../pages/Login/LoginScreen";
import RegisterScreen from "../pages/Register/RegisterScreen";
import SummaryScreen from "../pages/Summary/SummaryScreen";
import UsersScreen from "../pages/Users/UsersScreen";
import CompaniesScreen from "../pages/Companies/CompaniesScreen";
import UserProfileScreen from "../pages/UserProfile/UserProfileScreen";
import CatalogScreen from "../pages/Catalog/CatalogScreen";
=======
import LoginScreen from "../pages/Login/LoginScreen";
import RegisterScreen from "../pages/Register/RegisterScreen";
>>>>>>> 1d9b27f06e014aee657297e5bff5c24922024789

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />
<<<<<<< HEAD

      <Route element={<ProtectedRoute />}>
        <Route element={<PanelTemplate />}>
          <Route path="/resumen" element={<SummaryScreen />} />
          <Route path="/catalogo/:categoria/:subcategoria" element={<CatalogScreen />} />
          <Route path="/usuarios" element={<UsersScreen />} />
          <Route path="/companias" element={<CompaniesScreen />} />
          <Route path="/perfil" element={<UserProfileScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/resumen" replace />} />
=======
      <Route path="/" element={<Navigate to="/login" replace />} />
>>>>>>> 1d9b27f06e014aee657297e5bff5c24922024789
    </Routes>
  );
};

export default AppRoutes;
