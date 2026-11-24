import { useState } from "react";
import { Box, FormControlLabel, Grid, Paper, Radio, RadioGroup, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { formatearPrecio } from "../../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary", height: "100%" };
const radio = <Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />;
const esEntero = (texto) => /^\d+$/.test(texto);

// forma de calculo del envio (por comuna o por peso) y retiro en el local
const ShippingSettings = ({ configuracion, onGuardar }) => {
  // la pantalla muestra este formulario recien cuando la configuracion ya cargo
  const [datos, setDatos] = useState(() => ({
    ...configuracion,
    costoBase: String(configuracion.costoBase),
    costoKilo: String(configuracion.costoKilo),
  }));
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos({ ...datos, [name]: type === "checkbox" ? checked : value });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    if (datos.forma === "Peso") {
      if (!esEntero(datos.costoBase.trim()) || Number(datos.costoBase) > 100000) e.costoBase = "Entre $0 y $100.000, sin puntos.";
      if (!esEntero(datos.costoKilo.trim()) || Number(datos.costoKilo) > 50000) e.costoKilo = "Entre $0 y $50.000, sin puntos.";
      if (!e.costoBase && !e.costoKilo && Number(datos.costoBase) === 0 && Number(datos.costoKilo) === 0)
        e.costoBase = "Indica el costo base o el costo por kilo.";
    }
    if (datos.tamanoMaximo.trim().length > 40) e.tamanoMaximo = "Máximo 40 caracteres.";
    if (datos.retiroLocal && datos.direccionRetiro.trim().length < 5) e.direccionRetiro = "Indica la dirección donde se retira.";
    return e;
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;
    setGuardando(true);
    await onGuardar({
      forma: datos.forma,
      costoBase: datos.forma === "Peso" ? Number(datos.costoBase) : 0,
      costoKilo: datos.forma === "Peso" ? Number(datos.costoKilo) : 0,
      tamanoMaximo: datos.tamanoMaximo.trim(),
      retiroLocal: datos.retiroLocal,
      direccionRetiro: datos.retiroLocal ? datos.direccionRetiro.trim() : "",
    });
    setGuardando(false);
  };

  const base = esEntero(datos.costoBase) ? Number(datos.costoBase) : 0;
  const kilo = esEntero(datos.costoKilo) ? Number(datos.costoKilo) : 0;

  return (
    <Box component="form" noValidate onSubmit={guardar} sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Forma de cálculo
            </Typography>
            <RadioGroup name="forma" value={datos.forma} onChange={cambiar} aria-label="Forma de cálculo del envío">
              <FormControlLabel value="Comuna" control={radio} label="Por comuna o región (tabla de abajo)" />
              <FormControlLabel value="Peso" control={radio} label="Según peso y dimensiones" />
            </RadioGroup>
            {datos.forma === "Peso" && (
              <>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField
                      label="Costo base"
                      name="costoBase"
                      required
                      type="number"
                      value={datos.costoBase}
                      onChange={cambiar}
                      error={Boolean(errores.costoBase)}
                      helperText={errores.costoBase ?? "Incluye el primer kilo"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField
                      label="Costo por kilo adicional"
                      name="costoKilo"
                      required
                      type="number"
                      value={datos.costoKilo}
                      onChange={cambiar}
                      error={Boolean(errores.costoKilo)}
                      helperText={errores.costoKilo ?? "Por cada kilo sobre el primero"}
                    />
                  </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  Ejemplo: un paquete de 2,5 kg cuesta {formatearPrecio(base)} + 2 × {formatearPrecio(kilo)} ={" "}
                  {formatearPrecio(base + 2 * kilo)}. La tabla de comunas sigue indicando a dónde despachas y en cuántos días.
                </Typography>
              </>
            )}
            <FormField
              label="Tamaño máximo por paquete"
              name="tamanoMaximo"
              placeholder="60 × 40 × 40 cm"
              value={datos.tamanoMaximo}
              onChange={cambiar}
              error={Boolean(errores.tamanoMaximo)}
              helperText={errores.tamanoMaximo ?? "Se muestra al cliente al momento de comprar"}
              sx={{ mt: 2 }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Retiro en el local
            </Typography>
            <CheckOption label="Permitir retiro sin costo" name="retiroLocal" checked={datos.retiroLocal} onChange={cambiar} />
            {datos.retiroLocal && (
              <FormField
                label="Dirección de retiro"
                name="direccionRetiro"
                required
                placeholder="Ramírez 1150, Osorno"
                value={datos.direccionRetiro}
                onChange={cambiar}
                error={Boolean(errores.direccionRetiro)}
                helperText={errores.direccionRetiro}
                sx={{ mt: 1.5 }}
              />
            )}
            <Box sx={{ mt: 2.5 }}>
              <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar configuración"}
              </CustomButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingSettings;
