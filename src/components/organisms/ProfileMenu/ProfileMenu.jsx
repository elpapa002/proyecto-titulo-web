import { useState } from "react";
import { Avatar, Box, Button, Divider, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RoleChip from "../../atoms/RoleChip/RoleChip";
import useUser from "../../../contexts/UserContext/useUser";
import { iniciales, nombreCorto } from "../../../utils/formato";

const ProfileMenu = ({ compacto = false }) => {
  const [ancla, setAncla] = useState(null);
  const { usuario, cerrarSesion } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!usuario) return null;

  const enTienda = pathname.startsWith("/tienda");
  const enMiTienda = pathname.startsWith("/mi-tienda");
  const rutaPerfil = enTienda ? "/tienda/perfil" : enMiTienda ? "/mi-tienda/perfil" : "/perfil";

  const opciones = [
    { texto: "Mi perfil", ruta: rutaPerfil, icono: <PersonOutlinedIcon fontSize="small" />, ver: true },
    {
      texto: "Mi tienda",
      ruta: "/mi-tienda",
      icono: <Inventory2OutlinedIcon fontSize="small" />,
      ver: usuario.roles.includes("Vendedor") && !enMiTienda,
    },
    {
      texto: "Administración",
      ruta: "/resumen",
      icono: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
      ver: usuario.roles.includes("Admin") && (enTienda || enMiTienda),
    },
    { texto: "Ir a la tienda", ruta: "/tienda", icono: <StorefrontOutlinedIcon fontSize="small" />, ver: !enTienda },
  ];

  const irA = (ruta) => {
    setAncla(null);
    navigate(ruta);
  };

  const salir = () => {
    setAncla(null);
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Button
        onClick={(e) => setAncla(e.currentTarget)}
        startIcon={
          compacto ? (
            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: 13 }}>{iniciales(usuario)}</Avatar>
          ) : (
            <PersonOutlinedIcon />
          )
        }
        endIcon={<KeyboardArrowDownIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(ancla)}
        aria-label="Menú de perfil"
        sx={{ color: "text.primary", fontWeight: 600, minWidth: 0 }}
      >
        <Box component="span" sx={{ display: compacto ? { xs: "none", sm: "inline" } : "inline" }}>
          {compacto ? usuario.nombres.split(" ")[0] : nombreCorto(usuario)}
        </Box>
      </Button>

      <Menu
        anchorEl={ancla}
        open={Boolean(ancla)}
        onClose={() => setAncla(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 280, mt: 1, border: "1px solid", borderColor: "text.primary" } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44, fontSize: 16 }}>{iniciales(usuario)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {usuario.nombres} {usuario.apellidos}
            </Typography>
            <Typography variant="body2">RUN {usuario.run}</Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.75, flexWrap: "wrap" }}>
              {usuario.roles.map((rol) => (
                <RoleChip key={rol} rol={rol} />
              ))}
            </Box>
          </Box>
        </Box>
        <Divider />
        {opciones
          .filter((opcion) => opcion.ver)
          .map((opcion) => (
            <MenuItem key={opcion.texto} onClick={() => irA(opcion.ruta)}>
              <ListItemIcon>{opcion.icono}</ListItemIcon>
              {opcion.texto}
            </MenuItem>
          ))}
        <MenuItem onClick={salir}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
