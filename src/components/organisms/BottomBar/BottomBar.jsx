import { Badge, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const BottomBar = ({ cantidadCarro, avisosSinLeer }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const opciones = [
    { ruta: "/tienda", texto: "Inicio", icono: <HomeOutlinedIcon /> },
    { ruta: "/tienda/compras", texto: "Compras", icono: <Inventory2OutlinedIcon /> },
    { ruta: "/tienda/deseos", texto: "Deseos", icono: <FavoriteBorderIcon /> },
    {
      ruta: "/tienda/avisos",
      texto: "Avisos",
      icono: (
        <Badge badgeContent={avisosSinLeer} color="primary">
          <NotificationsNoneOutlinedIcon />
        </Badge>
      ),
    },
    {
      ruta: "/tienda/carro",
      texto: "Carro",
      icono: (
        <Badge badgeContent={cantidadCarro} color="primary">
          <ShoppingCartOutlinedIcon />
        </Badge>
      ),
    },
  ];

  const activa = [...opciones].reverse().find((o) => pathname.startsWith(o.ruta))?.ruta ?? "/tienda";

  return (
    <Paper
      component="nav"
      aria-label="Menú inferior"
      square
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10, borderTop: "1px solid", borderColor: "text.primary" }}
    >
      <BottomNavigation
        showLabels
        value={activa}
        onChange={(_, ruta) => navigate(ruta)}
        sx={{ "& .Mui-selected": { color: "primary.main", fontWeight: 600 } }}
      >
        {opciones.map((opcion) => (
          <BottomNavigationAction key={opcion.ruta} value={opcion.ruta} label={opcion.texto} icon={opcion.icono} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomBar;
