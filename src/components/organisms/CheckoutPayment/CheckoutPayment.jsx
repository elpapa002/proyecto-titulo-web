import { Box, Grid, Paper, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import CheckOption from "../../molecules/CheckOption/CheckOption";

const tipos = [
  { valor: "Débito", texto: "Débito" },
  { valor: "Crédito", texto: "Crédito" },
];

const marcas = [
  { valor: "Visa", texto: "Visa" },
  { valor: "Mastercard", texto: "Mastercard" },
  { valor: "American Express", texto: "American Express" },
  { valor: "Redcompra", texto: "Redcompra" },
];

const CheckoutPayment = ({ datos, errores, onCambiar }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Typography variant="h3">Medio de pago</Typography>
      <Typography sx={{ mt: 0.5, mb: 2 }}>Los campos marcados con * son obligatorios.</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Tipo de tarjeta"
            name="tipo"
            required
            value={datos.tipo}
            onChange={onCambiar}
            opciones={tipos}
            error={Boolean(errores.tipo)}
            helperText={errores.tipo}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Marca"
            name="marca"
            required
            value={datos.marca}
            onChange={onCambiar}
            opciones={marcas}
            error={Boolean(errores.marca)}
            helperText={errores.marca ?? "Redcompra es solo para débito"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormField
            label="Últimos 4 dígitos de la tarjeta"
            name="ultimos4"
            required
            placeholder="4821"
            value={datos.ultimos4}
            onChange={onCambiar}
            error={Boolean(errores.ultimos4)}
            helperText={errores.ultimos4 ?? "Solo los 4 números del final"}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 4, autoComplete: "off" } }}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          border: "1px solid",
          borderColor: "text.primary",
          borderRadius: 1,
          p: 1.25,
          mt: 2,
        }}
      >
        <LockOutlinedIcon fontSize="small" />
        <Typography>
          Por seguridad no pedimos ni guardamos el número completo de tu tarjeta ni el código de seguridad. Solo
          registramos el tipo, la marca y los últimos 4 dígitos para que reconozcas el pago en tu boleta.
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <CheckOption
          name="acepto"
          checked={datos.acepto}
          onChange={onCambiar}
          label="Acepto las condiciones de compra y la política de devoluciones *"
        />
        {errores.acepto && (
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, mt: 0.5 }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 16 }} />
            {errores.acepto}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default CheckoutPayment;
