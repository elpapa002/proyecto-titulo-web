import { Box } from "@mui/material";
import logo from "../../../assets/logo.png";

const Logo = ({ size = 56, borde = false }) => {
  return (
    <Box
      component="img"
      src={logo}
      alt="Logo Compra y Venta"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        ...(borde && { border: "1px solid", borderColor: "text.primary" }),
      }}
    />
  );
};

export default Logo;
