import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";

const NavItem = ({ ruta, icono, texto, onClick, sangria = false }) => {
  return (
    <ListItemButton
      component={NavLink}
      to={ruta}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        pl: sangria ? 6.5 : 2,
        color: "secondary.main",
        "& .MuiListItemIcon-root": { color: "secondary.main", minWidth: 36 },
        "&.active": {
          bgcolor: "secondary.main",
          color: "primary.main",
          "& .MuiListItemIcon-root": { color: "primary.main" },
          "& .MuiListItemText-primary": { fontWeight: 600 },
        },
        "&.active:hover": { bgcolor: "secondary.main" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
      }}
    >
      {icono && <ListItemIcon>{icono}</ListItemIcon>}
      <ListItemText primary={texto} slotProps={{ primary: { sx: { fontSize: sangria ? 13 : 14 } } }} />
    </ListItemButton>
  );
};

export default NavItem;
