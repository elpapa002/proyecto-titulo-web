import { Box, Typography } from "@mui/material";
import Logo from "../../atoms/Logo/Logo";

const LoginBrand = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
      <Logo size={64} />
      <Box>
        <Typography component="h1" sx={{ fontSize: 22, fontWeight: 600, color: "secondary.main" }}>
          Compra y Venta
        </Typography>
        <Typography sx={{ fontSize: 14, color: "secondary.main" }}>
          Productos y servicios de emprendedores locales
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginBrand;
