import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Logo from "../../atoms/Logo/Logo";
import NavItem from "../../molecules/NavItem/NavItem";
import CategoryMenu from "../CategoryMenu/CategoryMenu";
import useUser from "../../../contexts/UserContext/useUser";
import { obtenerCategorias } from "../../../services/catalogService";
import { obtenerCompanias } from "../../../services/companyService";
import { nombreTienda } from "../../../utils/formato";

const administracion = [
  { ruta: "/usuarios", texto: "Gestión de usuarios", icono: <PeopleAltOutlinedIcon fontSize="small" /> },
  { ruta: "/companias", texto: "Compañías", icono: <ApartmentOutlinedIcon fontSize="small" /> },
  { ruta: "/categorias", texto: "Categorías", icono: <AccountTreeOutlinedIcon fontSize="small" /> },
];

const emprendedor = [
  { ruta: "/mi-tienda", texto: "Resumen", icono: <DashboardOutlinedIcon fontSize="small" />, exacta: true },
  { ruta: "/mi-tienda/publicaciones", texto: "Publicaciones", icono: <Inventory2OutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/ofertas", texto: "Ofertas", icono: <PercentOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/categorias", texto: "Categorías", icono: <AccountTreeOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/ventas", texto: "Ventas y pedidos", icono: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/cotizaciones", texto: "Cotizaciones", icono: <RequestQuoteOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/preguntas", texto: "Preguntas", icono: <HelpOutlineOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/devoluciones", texto: "Devoluciones", icono: <AssignmentReturnOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/envios", texto: "Costos de envío", icono: <LocalShippingOutlinedIcon fontSize="small" /> },
  { ruta: "/mi-tienda/mensajes", texto: "Mensajes", icono: <ChatBubbleOutlineIcon fontSize="small" /> },
  { ruta: "/mi-tienda/avisos", texto: "Avisos", icono: <NotificationsNoneOutlinedIcon fontSize="small" /> },
];

const tituloSeccion = { color: "secondary.main", opacity: 0.7, fontSize: 12, fontWeight: 600, px: 2, mt: 2, mb: 1 };

const botonInferior = {
  flexGrow: 0,
  borderRadius: 1,
  mt: 0.5,
  color: "secondary.main",
  "& .MuiListItemIcon-root": { color: "secondary.main", minWidth: 36 },
  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
};

const Sidebar = ({ tipo = "admin", onNavegar }) => {
  const { usuario, cerrarSesion } = useUser();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [companias, setCompanias] = useState([]);
  const esEmprendedor = tipo === "emprendedor";

  useEffect(() => {
    const cargar = async () => {
      const [respuestaCategorias, respuestaCompanias] = await Promise.all([obtenerCategorias(), obtenerCompanias()]);
      if (respuestaCategorias.ok) setCategorias(respuestaCategorias.datos);
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
    };
    cargar();
  }, []);

  const irA = (ruta) => {
    onNavegar?.();
    navigate(ruta);
  };

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      component="nav"
      aria-label="Menú principal"
      sx={{ width: 240, height: "100%", bgcolor: "text.primary", p: 2, display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
        <Logo size={40} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "secondary.main", fontWeight: 600, fontSize: 15 }}>Compra y Venta</Typography>
          <Typography noWrap sx={{ color: "secondary.main", fontSize: 12 }}>
            {esEmprendedor && usuario ? nombreTienda(usuario, companias) : "Administración"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {esEmprendedor ? (
          <List disablePadding>
            {emprendedor.map((opcion) => (
              <NavItem key={opcion.ruta} {...opcion} onClick={onNavegar} />
            ))}
          </List>
        ) : (
          <>
            <List disablePadding>
              <NavItem ruta="/resumen" texto="Resumen" icono={<DashboardOutlinedIcon fontSize="small" />} onClick={onNavegar} />
            </List>

            <Typography sx={tituloSeccion}>Catálogo</Typography>
            <CategoryMenu categorias={categorias} onNavegar={onNavegar} />

            <Typography sx={tituloSeccion}>Administración</Typography>
            <List disablePadding>
              {administracion.map((opcion) => (
                <NavItem key={opcion.ruta} {...opcion} onClick={onNavegar} />
              ))}
            </List>
          </>
        )}
      </Box>

      <ListItemButton onClick={() => irA("/tienda")} sx={botonInferior}>
        <ListItemIcon>
          <StorefrontOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Ir a la tienda" slotProps={{ primary: { sx: { fontSize: 14 } } }} />
      </ListItemButton>
      <ListItemButton onClick={salir} sx={botonInferior}>
        <ListItemIcon>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Cerrar sesión" slotProps={{ primary: { sx: { fontSize: 14 } } }} />
      </ListItemButton>
    </Box>
  );
};

export default Sidebar;
