import { useState } from "react";
import { Box } from "@mui/material";
import LoginBrand from "../../organisms/LoginBrand/LoginBrand";
import RegisterForm from "../../organisms/RegisterForm/RegisterForm";
import AuthTabs from "../../molecules/AuthTabs/AuthTabs";
import StepIndicator from "../../molecules/StepIndicator/StepIndicator";
import "../../../styles/Login.css";

const PASOS = ["Datos personales", "Contacto y dirección", "Empresa (solo emprendedores)"];

const RegisterTemplate = () => {
  const [paso, setPaso] = useState(1);

  return (
    <Box component="main" className="acceso-pagina">
      <StepIndicator pasos={PASOS} actual={paso} />
      <Box className="acceso-tarjeta" sx={{ maxWidth: 680 }}>
        <LoginBrand />
        <AuthTabs activa="registro" />
        <RegisterForm paso={paso} setPaso={setPaso} />
      </Box>
    </Box>
  );
};

export default RegisterTemplate;
