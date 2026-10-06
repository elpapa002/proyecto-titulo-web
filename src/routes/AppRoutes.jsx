import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import PanelTemplate from "../components/templates/PanelTemplate/PanelTemplate";
import ClientTemplate from "../components/templates/ClientTemplate/ClientTemplate";
import LoginScreen from "../pages/Login/LoginScreen";
import RegisterScreen from "../pages/Register/RegisterScreen";
import SummaryScreen from "../pages/Summary/SummaryScreen";
import UsersScreen from "../pages/Users/UsersScreen";
import CompaniesScreen from "../pages/Companies/CompaniesScreen";
import UserProfileScreen from "../pages/UserProfile/UserProfileScreen";
import CatalogScreen from "../pages/Catalog/CatalogScreen";
import ClientHomeScreen from "../pages/ClientHome/ClientHomeScreen";
import StoreSummaryScreen from "../pages/StoreSummary/StoreSummaryScreen";
import MyProductsScreen from "../pages/MyProducts/MyProductsScreen";
import ProductFormScreen from "../pages/ProductForm/ProductFormScreen";
import useUser from "../contexts/UserContext/useUser";
import { rutaInicio } from "../utils/roles";

const AppRoutes = () => {
  const { usuario, sesionVigente } = useUser();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={["Admin"]} />}>
          <Route element={<PanelTemplate tipo="admin" />}>
            <Route path="/resumen" element={<SummaryScreen />} />
            <Route path="/catalogo/:categoria/:subcategoria" element={<CatalogScreen />} />
            <Route path="/usuarios" element={<UsersScreen />} />
            <Route path="/companias" element={<CompaniesScreen />} />
            <Route path="/perfil" element={<UserProfileScreen />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["Vendedor"]} />}>
          <Route element={<PanelTemplate tipo="emprendedor" />}>
            <Route path="/mi-tienda" element={<StoreSummaryScreen />} />
            <Route path="/mi-tienda/publicaciones" element={<MyProductsScreen />} />
            <Route path="/mi-tienda/publicaciones/nueva" element={<ProductFormScreen />} />
            <Route path="/mi-tienda/publicaciones/:id/editar" element={<ProductFormScreen />} />
            <Route path="/mi-tienda/perfil" element={<UserProfileScreen />} />
          </Route>
        </Route>

        <Route element={<ClientTemplate />}>
          <Route path="/tienda" element={<ClientHomeScreen />} />
          <Route path="/tienda/perfil" element={<UserProfileScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={sesionVigente() ? rutaInicio(usuario) : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
