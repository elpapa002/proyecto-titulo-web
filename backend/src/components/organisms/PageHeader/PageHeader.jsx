import { Box, IconButton, Typography } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../../atoms/Logo/Logo";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

const PageHeader = ({ titulo, subtitulo, acciones }) => {
  const { abrirMenu, esMovil, enTienda } = useOutletContext();

  return (
    <Box
      component="header"
      sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        {esMovil && abrirMenu && (
          <IconButton onClick={abrirMenu} aria-label="Abrir menú" sx={{ mt: -0.5 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Box>
          <Typography variant="h1">{titulo}</Typography>
          {subtitulo && <Typography sx={{ mt: 0.5 }}>{subtitulo}</Typography>}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        {acciones}
        {!enTienda && <Logo size={40} borde />}
        {!enTienda && <ProfileMenu />}
      </Box>
    </Box>
  );
};

export default PageHeader;
