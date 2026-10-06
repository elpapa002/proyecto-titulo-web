import { useState } from "react";
import { Badge, Box, Button, ButtonBase, InputAdornment, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import Logo from "../../atoms/Logo/Logo";
import CustomButton from "../../atoms/Button/CustomButton";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import useUser from "../../../contexts/UserContext/useUser";

const IconoBarra = ({ icono, texto, cantidad = 0, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{ flexDirection: "column", gap: 0.25, px: 1, py: 0.5, borderRadius: 1, color: "text.primary" }}
  >
    <Badge badgeContent={cantidad} color="primary">
      {icono}
    </Badge>
    <Typography sx={{ fontSize: 11 }}>{texto}</Typography>
  </ButtonBase>
);

const ClientHeader = ({ cantidadDeseos }) => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [texto, setTexto] = useState(params.get("buscar") ?? "");

  const buscar = (evento) => {
    evento.preventDefault();
    const limpio = texto.trim();
    navigate(limpio ? `/tienda?buscar=${encodeURIComponent(limpio)}` : "/tienda");
  };

  const esVendedor = usuario?.roles.includes("Vendedor");
  const esAdmin = usuario?.roles.includes("Admin");

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "secondary.main",
        borderBottom: "1px solid",
        borderColor: "text.primary",
        px: { xs: 2, md: 3 },
        py: 1.25,
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, md: 2 },
        flexWrap: { xs: "wrap", md: "nowrap" },
      }}
    >
      <ButtonBase onClick={() => navigate("/tienda")} sx={{ gap: 1, borderRadius: 1 }} aria-label="Ir al inicio">
        <Logo size={36} borde />
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: "primary.main", display: { xs: "none", sm: "block" } }}>
          Compra y Venta
        </Typography>
      </ButtonBase>

      <Box
        component="form"
        role="search"
        onSubmit={buscar}
        sx={{ order: { xs: 3, md: 0 }, flexBasis: { xs: "100%", md: "auto" }, flexGrow: 1, maxWidth: { md: 460 } }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar productos, servicios o emprendedores"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Buscar" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" variant="contained" size="small" sx={{ minHeight: 30, mr: -1 }}>
                    Buscar
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
        <IconoBarra
          icono={<LocalOfferOutlinedIcon fontSize="small" />}
          texto="Ofertas"
          onClick={() => navigate("/tienda?vista=ofertas")}
        />
        <IconoBarra
          icono={<FavoriteBorderIcon fontSize="small" />}
          texto="Deseos"
          cantidad={cantidadDeseos}
          onClick={() => navigate("/tienda?vista=deseos")}
        />
        {esVendedor && (
          <CustomButton
            tono="contorno"
            startIcon={<StorefrontOutlinedIcon />}
            onClick={() => navigate("/mi-tienda")}
            sx={{ ml: 1, display: { xs: "none", sm: "inline-flex" } }}
          >
            Mi tienda
          </CustomButton>
        )}
        {esAdmin && (
          <CustomButton
            tono="contorno"
            startIcon={<AdminPanelSettingsOutlinedIcon />}
            onClick={() => navigate("/resumen")}
            sx={{ ml: 1, display: { xs: "none", sm: "inline-flex" } }}
          >
            Administración
          </CustomButton>
        )}
        <ProfileMenu compacto />
      </Box>
    </Box>
  );
};

export default ClientHeader;
