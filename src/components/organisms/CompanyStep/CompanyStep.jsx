import { Box, Grid, Typography } from "@mui/material";
import LoginField from "../../molecules/LoginField/LoginField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { validarRut } from "../../../utils/rut";

const CompanyStep = ({ empresa, errores, cambiarEmpresa }) => {
  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    cambiarEmpresa(name, type === "checkbox" ? checked : value);
  };

  return (
    <>
      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          Paso 3: datos de tu empresa
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Validamos el RUT y activamos tu perfil de emprendedor. Los campos con * son obligatorios.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="RUT de la empresa"
            name="rut"
            placeholder="76.543.210-3"
            value={empresa.rut}
            onChange={cambiar}
            required
            slotProps={{ htmlInput: { maxLength: 12 } }}
            error={Boolean(errores.rut)}
            helperText={errores.rut ?? (validarRut(empresa.rut) ? "RUT válido" : " ")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Nombre de la empresa"
            name="nombre"
            required
            placeholder="Textiles del Sur SpA"
            value={empresa.nombre}
            onChange={cambiar}
            error={Boolean(errores.nombre)}
            helperText={errores.nombre}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Número de personas"
            name="personas"
            required
            type="number"
            placeholder="4"
            value={empresa.personas}
            onChange={cambiar}
            error={Boolean(errores.personas)}
            helperText={errores.personas}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Teléfono de la empresa"
            name="telefono"
            required
            placeholder="+56 64 223 4567"
            value={empresa.telefono}
            onChange={cambiar}
            error={Boolean(errores.telefono)}
            helperText={errores.telefono}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Correo de contacto"
            name="correo"
            required
            type="email"
            placeholder="contacto@textilesdelsur.cl"
            value={empresa.correo}
            onChange={cambiar}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <LoginField
            label="Sitio web (opcional)"
            name="sitioWeb"
            placeholder="www.textilesdelsur.cl"
            value={empresa.sitioWeb}
            onChange={cambiar}
          />
        </Grid>
      </Grid>
      <LoginField
        label="Dirección del local (opcional)"
        name="direccion"
        placeholder="Ramírez 1150, Osorno"
        value={empresa.direccion}
        onChange={cambiar}
      />

      <Box>
        <Typography variant="h3" sx={{ color: "secondary.main" }}>
          ¿Qué vas a ofrecer?
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary.main", mt: 1 }}>
          Debes marcar al menos una opción.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
          <CheckOption
            oscuro
            label="Bienes y productos"
            name="ofreceProductos"
            checked={empresa.ofreceProductos}
            onChange={cambiar}
          />
          <CheckOption
            oscuro
            label="Servicios"
            name="ofreceServicios"
            checked={empresa.ofreceServicios}
            onChange={cambiar}
          />
        </Box>
        {errores.oferta && (
          <Typography variant="body2" role="alert" sx={{ color: "secondary.main", mt: 1, fontWeight: 600 }}>
            {errores.oferta}
          </Typography>
        )}
      </Box>
    </>
  );
};

export default CompanyStep;
