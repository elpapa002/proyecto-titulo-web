import { useState } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import PasswordField from "../../molecules/PasswordField/PasswordField";
import RememberUser from "../../molecules/RememberUser/RememberUser";
import Notice from "../../molecules/Notice/Notice";
import useUser from "../../../contexts/UserContext/useUser";
import { iniciarSesion as iniciarSesionApi } from "../../../services/authService";
import { formatearRut, formatearRutEscritura, validarRut } from "../../../utils/rut";
import { encriptarClave } from "../../../utils/clave";
import { rutaInicio } from "../../../utils/roles";

const LoginForm = ({ runInicial = "" }) => {
  const [datos, setDatos] = useState({ run: runInicial, clave: "", recordar: true });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");

  const { iniciarSesion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    const valor = name === "run" ? formatearRutEscritura(value) : value;
    setDatos({ ...datos, [name]: type === "checkbox" ? checked : valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const nuevos = {};
    if (!validarRut(datos.run)) nuevos.run = "Ingresa un RUN válido, con guion y dígito verificador.";
    if (!datos.clave) nuevos.clave = "Ingresa tu clave de acceso.";
    return nuevos;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    const datosLogin = {
      run: formatearRut(datos.run),
      clave: await encriptarClave(datos.clave),
      recordarSesion: datos.recordar,
    };
    console.log("Datos de inicio de sesión:", datosLogin);

    const respuesta = await iniciarSesionApi(datosLogin);
    setEnviando(false);

    if (!respuesta.ok) {
      setAviso("No se pudo iniciar sesión. Intenta de nuevo.");
      return;
    }

    const { usuario, token } = respuesta.datos;
    iniciarSesion(usuario, token, datos.recordar);
    navigate(location.state?.desde ?? rutaInicio(usuario), { replace: true });
  };

  return (
    <Stack component="form" onSubmit={enviar} noValidate spacing={2.5}>
      <LoginField
        label="RUN"
        name="run"
        placeholder="11.111.111-1"
        value={datos.run}
        onChange={cambiar}
        error={Boolean(errores.run)}
        helperText={errores.run}
        autoComplete="username"
        required
        slotProps={{ htmlInput: { inputMode: "text", maxLength: 12 } }}
      />
      <PasswordField
        oscuro
        label="Contraseña"
        name="clave"
        value={datos.clave}
        onChange={cambiar}
        error={Boolean(errores.clave)}
        helperText={errores.clave}
        autoComplete="current-password"
        required
        autoFocus={Boolean(runInicial)}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <RememberUser checked={datos.recordar} onChange={cambiar} />
        <Link
          component="button"
          type="button"
          onClick={() => setAviso("La recuperación de contraseña se activa cuando esté listo el backend.")}
          sx={{ color: "secondary.main", fontSize: 14, textDecorationColor: "inherit" }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>

      <CustomButton tono="claro" type="submit" fullWidth disabled={enviando}>
        {enviando ? "Ingresando..." : "Ingresar"}
      </CustomButton>

      <Typography variant="body2" sx={{ color: "secondary.main" }}>
        Ingresa con tu RUN y tu clave de acceso. Si eres emprendedor, después administras tu tienda desde «Mi tienda».
      </Typography>

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </Stack>
  );
};

export default LoginForm;
