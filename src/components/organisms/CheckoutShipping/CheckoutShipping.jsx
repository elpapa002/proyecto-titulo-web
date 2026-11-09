import { Box, FormControlLabel, Link, Paper, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { formatearPrecio } from "../../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const Fila = ({ texto, valor }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75 }}>
    <Typography>{texto}</Typography>
    <Typography sx={{ textAlign: "right" }}>{valor}</Typography>
  </Box>
);

const CheckoutShipping = ({ direcciones, cargando, direccionId, onElegir, envio, tienda }) => {
  const direccion = direcciones.find((d) => d.id === direccionId);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={tarjeta}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Dirección de despacho
        </Typography>

        {cargando && <Typography>Cargando tus direcciones...</Typography>}
        {!cargando && direcciones.length === 0 && (
          <Typography>No tienes direcciones guardadas. Agrega una en Mi perfil para poder continuar.</Typography>
        )}
        {!cargando && direcciones.length > 0 && (
          <RadioGroup
            name="direccion"
            value={direccionId ?? ""}
            onChange={(e) => onElegir(Number(e.target.value))}
            aria-label="Dirección de despacho"
          >
            <Stack spacing={1.5}>
              {direcciones.map((d) => {
                const elegida = d.id === direccionId;
                return (
                  <Box
                    key={d.id}
                    sx={{
                      border: elegida ? "2px solid" : "1px solid",
                      borderColor: elegida ? "primary.main" : "text.primary",
                      borderRadius: 1,
                      px: 1.5,
                      py: elegida ? "7px" : 1,
                    }}
                  >
                    <FormControlLabel
                      value={d.id}
                      sx={{ m: 0, width: "100%", gap: 0.5, alignItems: "flex-start" }}
                      control={
                        <Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />
                      }
                      label={
                        <Box sx={{ pt: 0.75 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {d.calle} {d.numero}, {d.comuna}
                          </Typography>
                          <Typography variant="body2">
                            Código postal {d.codigoPostal}
                            {d.principal ? " · Principal" : ""}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                );
              })}
            </Stack>
          </RadioGroup>
        )}

        <Link
          component={RouterLink}
          to="/tienda/perfil"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 2,
            color: "text.primary",
            fontWeight: 600,
            textDecorationColor: "inherit",
          }}
        >
          <AddIcon fontSize="small" />
          Agregar o editar direcciones en Mi perfil
        </Link>
      </Paper>

      <Paper variant="outlined" sx={tarjeta}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <LocalShippingOutlinedIcon />
          <Typography variant="h3">Costo de envío</Typography>
        </Box>

        {!direccion && <Typography>Elige una dirección para calcular el envío.</Typography>}
        {direccion && !envio && <Typography>Calculando el costo de envío a {direccion.comuna}...</Typography>}
        {direccion && envio?.ok && (
          <>
            <Fila texto="Comuna de destino" valor={direccion.comuna} />
            <Fila texto="Emprendedor" valor={tienda} />
            <Fila texto="Forma de cálculo" valor="Tarifa por comuna del emprendedor" />
            <Fila
              texto="Tiempo estimado"
              valor={envio.datos.dias === 1 ? "1 día hábil" : `${envio.datos.dias} días hábiles`}
            />
            <Fila texto="Costo de envío" valor={formatearPrecio(envio.datos.costo)} />
          </>
        )}
        {direccion && envio && !envio.ok && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 1,
              p: 1.25,
            }}
          >
            <WarningAmberOutlinedIcon fontSize="small" />
            <Typography>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {envio.error}
              </Box>{" "}
              Elige otra dirección o agrega una nueva en Mi perfil.
            </Typography>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default CheckoutShipping;
