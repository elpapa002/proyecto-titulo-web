import { useState } from "react";
import { Box } from "@mui/material";
import LoginBrand from "../../organisms/LoginBrand/LoginBrand";
import LoginForm from "../../organisms/LoginForm/LoginForm";
import AuthTabs from "../../molecules/AuthTabs/AuthTabs";
import Notice from "../../molecules/Notice/Notice";
import "../../../styles/Login.css";

const LoginTemplate = ({ mensajeInicial = "" }) => {
  const [mensaje, setMensaje] = useState(mensajeInicial);

  return (
    <Box component="main" className="acceso-pagina">
      <Box className="acceso-tarjeta" sx={{ maxWidth: 520 }}>
        <LoginBrand />
        <AuthTabs activa="login" />
        <LoginForm />
      </Box>
      <Notice mensaje={mensaje} onClose={() => setMensaje("")} />
    </Box>
  );
};

export default LoginTemplate;
