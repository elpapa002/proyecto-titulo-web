import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import SelectField from "../../molecules/SelectField/SelectField";
import { comunas } from "../../../services/datosPrueba";

const opcionesComuna = comunas.map((c) => ({ valor: c, texto: c }));

const ContactStep = ({ datos, errores, cambiarContacto, agregarContacto, cambiarDireccion, agregarDireccion }) => {
  return (
    <>
      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          Paso 2: teléfonos, correos y dirección
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Cada teléfono y cada correo puede pertenecer a una sola persona.
        </Typography>
      </Box>

      {datos.contactos.map((contacto, i) => (
        <Grid container spacing={2} key={`contacto-${i}`}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LoginField
              label={i === 0 ? "Teléfono (Opcional)" : `Teléfono ${i + 1} (Opcional)`}
              placeholder="+56 9 8765 4321"
              value={contacto.telefono}
              onChange={(e) => cambiarContacto(i, "telefono", e.target.value)}
              error={Boolean(errores[`telefono${i}`])}
              helperText={errores[`telefono${i}`]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LoginField
              label={i === 0 ? "Correo" : `Correo ${i + 1}`}
              type="email"
              placeholder="camila.rojas@gmail.com"
              value={contacto.correo}
              onChange={(e) => cambiarContacto(i, "correo", e.target.value)}
              error={Boolean(errores[`correo${i}`])}
              helperText={errores[`correo${i}`]}
            />
          </Grid>
        </Grid>
      ))}
      <Box>
        <CustomButton tono="claro" startIcon={<AddIcon />} onClick={agregarContacto}>
          Agregar otro teléfono o correo
        </CustomButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          Dirección de despacho (obligatoria)
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Puedes registrar varias direcciones; la primera queda como principal.
        </Typography>
      </Box>

      {datos.direcciones.map((direccion, i) => (
        <Stack key={`direccion-${i}`} spacing={1}>
          {i > 0 && (
            <Typography sx={{ color: "secondary.main", fontWeight: 600, fontSize: 14 }}>Dirección {i + 1}</Typography>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LoginField
                label="Calle"
                placeholder="Av. Juan Mackenna"
                value={direccion.calle}
                onChange={(e) => cambiarDireccion(i, "calle", e.target.value)}
                error={Boolean(errores[`calle${i}`])}
                helperText={errores[`calle${i}`]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LoginField
                label="Número"
                placeholder="1270"
                value={direccion.numero}
                onChange={(e) => cambiarDireccion(i, "numero", e.target.value)}
                error={Boolean(errores[`numero${i}`])}
                helperText={errores[`numero${i}`]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                oscuro
                label="Comuna"
                opciones={opcionesComuna}
                value={direccion.comuna}
                onChange={(e) => cambiarDireccion(i, "comuna", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LoginField
                label="Código postal"
                placeholder="5290000"
                value={direccion.codigoPostal}
                onChange={(e) => cambiarDireccion(i, "codigoPostal", e.target.value)}
              />
            </Grid>
          </Grid>
        </Stack>
      ))}
      <Box>
        <CustomButton tono="claro" startIcon={<AddIcon />} onClick={agregarDireccion}>
          Agregar otra dirección
        </CustomButton>
      </Box>
    </>
  );
};

export default ContactStep;
