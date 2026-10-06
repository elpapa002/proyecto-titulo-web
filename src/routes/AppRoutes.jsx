import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PanelTemplate from "../components/templates/PanelTemplate/PanelTemplate";
import LoginScreen from "../pages/Login/LoginScreen";
import RegisterScreen from "../pages/Register/RegisterScreen";
import SummaryScreen from "../pages/Summary/SummaryScreen";
import UsersScreen from "../pages/Users/UsersScreen";
import CompaniesScreen from "../pages/Companies/CompaniesScreen";
import UserProfileScreen from "../pages/UserProfile/UserProfileScreen";
import CatalogScreen from "../pages/Catalog/CatalogScreen";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />

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
    </Routes>
  );
};

export default AppRoutes;
