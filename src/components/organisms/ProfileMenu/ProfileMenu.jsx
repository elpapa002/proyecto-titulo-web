import { useState } from "react";
import { Avatar, Box, Button, Divider, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RoleChip from "../../atoms/RoleChip/RoleChip";
import useUser from "../../../contexts/UserContext/useUser";
import { iniciales, nombreCorto } from "../../../utils/formato";

const ProfileMenu = () => {
  const [ancla, setAncla] = useState(null);
  const { usuario, cerrarSesion } = useUser();
  const navigate = useNavigate();

  if (!usuario) return null;

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
        startIcon={<PersonOutlinedIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(ancla)}
        sx={{ color: "text.primary", fontWeight: 600 }}
      >
        {nombreCorto(usuario)}
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
        <MenuItem onClick={() => irA("/perfil")}>
          <ListItemIcon>
            <PersonOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
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
