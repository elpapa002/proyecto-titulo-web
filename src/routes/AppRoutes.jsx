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
import ProductDetailScreen from "../pages/ProductDetail/ProductDetailScreen";
import WishlistScreen from "../pages/Wishlist/WishlistScreen";
import CartScreen from "../pages/Cart/CartScreen";
import CheckoutScreen from "../pages/Checkout/CheckoutScreen";
import MyPurchasesScreen from "../pages/MyPurchases/MyPurchasesScreen";
import PurchaseDetailScreen from "../pages/PurchaseDetail/PurchaseDetailScreen";
import MyQuotesScreen from "../pages/MyQuotes/MyQuotesScreen";
import MessagesScreen from "../pages/Messages/MessagesScreen";
import NotificationsScreen from "../pages/Notifications/NotificationsScreen";
import StoreSummaryScreen from "../pages/StoreSummary/StoreSummaryScreen";
import MyProductsScreen from "../pages/MyProducts/MyProductsScreen";
import ProductFormScreen from "../pages/ProductForm/ProductFormScreen";
import OffersScreen from "../pages/Offers/OffersScreen";
import CategoriesScreen from "../pages/Categories/CategoriesScreen";
import SalesScreen from "../pages/Sales/SalesScreen";
import SaleDetailScreen from "../pages/SaleDetail/SaleDetailScreen";
import ReceivedQuotesScreen from "../pages/ReceivedQuotes/ReceivedQuotesScreen";
import QuestionsScreen from "../pages/Questions/QuestionsScreen";
import ReturnsScreen from "../pages/Returns/ReturnsScreen";
import ShippingCostsScreen from "../pages/ShippingCosts/ShippingCostsScreen";
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
            <Route path="/categorias" element={<CategoriesScreen />} />
            <Route path="/perfil" element={<UserProfileScreen />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["Vendedor"]} />}>
          <Route element={<PanelTemplate tipo="emprendedor" />}>
            <Route path="/mi-tienda" element={<StoreSummaryScreen />} />
            <Route path="/mi-tienda/publicaciones" element={<MyProductsScreen />} />
            <Route path="/mi-tienda/publicaciones/nueva" element={<ProductFormScreen />} />
            <Route path="/mi-tienda/publicaciones/:id/editar" element={<ProductFormScreen />} />
            <Route path="/mi-tienda/ofertas" element={<OffersScreen />} />
            <Route path="/mi-tienda/categorias" element={<CategoriesScreen />} />
            <Route path="/mi-tienda/ventas" element={<SalesScreen />} />
            <Route path="/mi-tienda/ventas/:id" element={<SaleDetailScreen />} />
            <Route path="/mi-tienda/cotizaciones" element={<ReceivedQuotesScreen />} />
            <Route path="/mi-tienda/preguntas" element={<QuestionsScreen />} />
            <Route path="/mi-tienda/devoluciones" element={<ReturnsScreen />} />
            <Route path="/mi-tienda/envios" element={<ShippingCostsScreen />} />
            <Route path="/mi-tienda/mensajes" element={<MessagesScreen />} />
            <Route path="/mi-tienda/avisos" element={<NotificationsScreen />} />
            <Route path="/mi-tienda/perfil" element={<UserProfileScreen />} />
          </Route>
        </Route>

        <Route element={<ClientTemplate />}>
          <Route path="/tienda" element={<ClientHomeScreen />} />
          <Route path="/tienda/producto/:id" element={<ProductDetailScreen />} />
          <Route path="/tienda/deseos" element={<WishlistScreen />} />
          <Route path="/tienda/carro" element={<CartScreen />} />
          <Route path="/tienda/compra" element={<CheckoutScreen />} />
          <Route path="/tienda/compras" element={<MyPurchasesScreen />} />
          <Route path="/tienda/compras/:id" element={<PurchaseDetailScreen />} />
          <Route path="/tienda/cotizaciones" element={<MyQuotesScreen />} />
          <Route path="/tienda/mensajes" element={<MessagesScreen />} />
          <Route path="/tienda/avisos" element={<NotificationsScreen />} />
          <Route path="/tienda/perfil" element={<UserProfileScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={sesionVigente() ? rutaInicio(usuario) : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
