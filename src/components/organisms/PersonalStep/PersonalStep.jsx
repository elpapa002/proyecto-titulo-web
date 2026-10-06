import { Box, Grid, Typography } from "@mui/material";
import LoginField from "../../molecules/LoginField/LoginField";
import PasswordField from "../../molecules/PasswordField/PasswordField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { validarRut } from "../../../utils/rut";
import { calcularEdad } from "../../../utils/formato";

const PersonalStep = ({ datos, errores, cambiar, cambiarCasilla }) => {
  const edad = calcularEdad(datos.fechaNacimiento);
  const textoEdad =
    edad === null ? "" : `Edad calculada: ${edad} años${edad < 18 ? " (menor de edad)" : ""}`;

  return (
    <>
      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          Paso 1: tus datos personales
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Validamos tu RUN con su dígito verificador y calculamos tu edad con tu fecha de nacimiento.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="RUN"
            name="run"
            placeholder="20.456.789-1"
            value={datos.run}
            onChange={cambiar}
            error={Boolean(errores.run)}
            helperText={errores.run ?? (validarRut(datos.run) ? "RUN válido" : " ")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Fecha de nacimiento"
            name="fechaNacimiento"
            type="date"
            value={datos.fechaNacimiento}
            onChange={cambiar}
            error={Boolean(errores.fechaNacimiento)}
            helperText={errores.fechaNacimiento ?? (textoEdad || " ")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Nombres"
            name="nombres"
            placeholder="Camila Andrea"
            value={datos.nombres}
            onChange={cambiar}
            error={Boolean(errores.nombres)}
            helperText={errores.nombres}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Apellidos"
            name="apellidos"
            placeholder="Rojas Pérez"
            value={datos.apellidos}
            onChange={cambiar}
            error={Boolean(errores.apellidos)}
            helperText={errores.apellidos}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PasswordField
            oscuro
            label="Clave de acceso"
            name="clave"
            value={datos.clave}
            onChange={cambiar}
            error={Boolean(errores.clave)}
            helperText={errores.clave ?? "Mínimo 8 caracteres"}
            autoComplete="new-password"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PasswordField
            oscuro
            label="Reescribe la clave"
            name="clave2"
            value={datos.clave2}
            onChange={cambiar}
            error={Boolean(errores.clave2)}
            helperText={errores.clave2}
            autoComplete="new-password"
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          ¿Cómo usarás la plataforma?
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Puedes marcar las dos opciones.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
          <CheckOption
            oscuro
            label="Cliente: quiero comprar"
            name="esCliente"
            checked={datos.esCliente}
            onChange={cambiarCasilla}
          />
          <CheckOption
            oscuro
            label="Emprendedor: quiero vender"
            name="esEmprendedor"
            checked={datos.esEmprendedor}
            onChange={cambiarCasilla}
          />
        </Box>
        {errores.tipoCuenta && (
          <Typography variant="body2" role="alert" sx={{ color: "secondary.main", mt: 1, fontWeight: 600 }}>
            {errores.tipoCuenta}
          </Typography>
        )}
      </Box>
    </>
  );
};

export default PersonalStep;
