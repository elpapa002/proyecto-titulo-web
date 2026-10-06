import { useState } from "react";
import { Box, Typography } from "@mui/material";
import CustomButton from "../../atoms/Button/CustomButton";
import LoginBrand from "../../organisms/LoginBrand/LoginBrand";
import LoginForm from "../../organisms/LoginForm/LoginForm";
import AuthTabs from "../../molecules/AuthTabs/AuthTabs";
import Notice from "../../molecules/Notice/Notice";
import { usuariosEjemplo } from "../../../utils/roles";
import "../../../styles/Login.css";

const LoginTemplate = ({ mensajeInicial = "" }) => {
  const [mensaje, setMensaje] = useState(mensajeInicial);
  const [runEjemplo, setRunEjemplo] = useState("");

  const elegirEjemplo = (ejemplo) => {
    setRunEjemplo(ejemplo.run);
    setMensaje(`RUN de ${ejemplo.rol.toLowerCase()} listo. Escribe cualquier clave y presiona Ingresar.`);
  };

  return (
    <Box component="main" className="acceso-pagina">
      <Box className="acceso-tarjeta" sx={{ maxWidth: 520 }}>
        <LoginBrand />
        <AuthTabs activa="login" />
        <LoginForm key={runEjemplo} runInicial={runEjemplo} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography>Recorrer el prototipo como:</Typography>
        {usuariosEjemplo.map((ejemplo) => (
          <CustomButton key={ejemplo.rol} tono="contorno" size="small" onClick={() => elegirEjemplo(ejemplo)}>
            {ejemplo.rol}
          </CustomButton>
        ))}
      </Box>

      <Notice mensaje={mensaje} onClose={() => setMensaje("")} />
    </Box>
  );
};

export default LoginTemplate;
