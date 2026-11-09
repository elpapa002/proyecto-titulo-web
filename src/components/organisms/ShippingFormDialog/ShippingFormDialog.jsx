import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import { comunas } from "../../../services/datosPrueba";
import { formatearPrecio } from "../../../utils/formato";

const COSTO_MAXIMO = 50000;
const DIAS_MAXIMO = 30;

const esEntero = (texto) => /^-?\d+$/.test(texto);

const ShippingFormDialog = ({ costo, costos, onCerrar, onGuardar }) => {
  const editando = Boolean(costo);
  const [datos, setDatos] = useState({
    comuna: costo?.comuna ?? "",
    costo: costo ? String(costo.costo) : "",
    dias: costo ? String(costo.dias) : "",
  });
  const [errores, setErrores] = useState({});
  const [errorServicio, setErrorServicio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const usadas = costos.filter((c) => c.id !== costo?.id).map((c) => c.comuna);
  const opciones = comunas.map((c) => ({ valor: c, texto: usadas.includes(c) ? `${c} (ya agregada)` : c }));

  const costoEscrito = datos.costo.trim();
  const diasEscritos = datos.dias.trim();

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: undefined });
    setErrorServicio("");
  };

  const validar = () => {
    const e = {};
    if (!datos.comuna) e.comuna = "Elige una comuna.";

    if (!costoEscrito) e.costo = "Ingresa el costo. Usa 0 si el envío es gratis.";
    else if (!esEntero(costoEscrito)) e.costo = "Debe ser un número entero, sin puntos ni decimales.";
    else if (Number(costoEscrito) < 0 || Number(costoEscrito) > COSTO_MAXIMO)
      e.costo = `El costo debe estar entre $0 y ${formatearPrecio(COSTO_MAXIMO)}.`;

    if (!diasEscritos) e.dias = "Ingresa los días estimados.";
    else if (!esEntero(diasEscritos)) e.dias = "Debe ser un número entero de días.";
    else if (Number(diasEscritos) < 1 || Number(diasEscritos) > DIAS_MAXIMO)
      e.dias = `Debe estar entre 1 y ${DIAS_MAXIMO} días.`;
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosEnvio = { comuna: datos.comuna, costo: Number(costoEscrito), dias: Number(diasEscritos) };

    setGuardando(true);
    const error = await onGuardar(datosEnvio);
    setGuardando(false);
    if (error) setErrorServicio(error);
  };

  const costoValido = esEntero(costoEscrito) && Number(costoEscrito) >= 0 && Number(costoEscrito) <= COSTO_MAXIMO;
  const ayudaCosto = costoValido
    ? Number(costoEscrito) === 0
      ? "Envío gratis"
      : `Se mostrará como ${formatearPrecio(costoEscrito)}`
    : `Entre $0 y ${formatearPrecio(COSTO_MAXIMO)}. Usa 0 para envío gratis.`;

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">{editando ? "Editar costo de envío" : "Agregar comuna"}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Cuánto cobras por despachar a esta comuna. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <SelectField
          label="Comuna"
          name="comuna"
          required
          value={datos.comuna}
          onChange={cambiar}
          opciones={opciones}
          error={Boolean(errores.comuna)}
          helperText={errores.comuna ?? "Comunas de la Región de Los Lagos"}
        />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Costo"
              name="costo"
              required
              type="number"
              placeholder="2990"
              value={datos.costo}
              onChange={cambiar}
              slotProps={{ htmlInput: { min: 0, max: COSTO_MAXIMO, step: 1 } }}
              error={Boolean(errores.costo)}
              helperText={errores.costo ?? ayudaCosto}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Días estimados"
              name="dias"
              required
              type="number"
              placeholder="2"
              value={datos.dias}
              onChange={cambiar}
              slotProps={{ htmlInput: { min: 1, max: DIAS_MAXIMO, step: 1 } }}
              error={Boolean(errores.dias)}
              helperText={errores.dias ?? `Días hábiles, entre 1 y ${DIAS_MAXIMO}`}
            />
          </Grid>
        </Grid>

        {errorServicio && (
          <Box
            role="alert"
            sx={{
              mt: 2,
              p: 1.5,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 1,
            }}
          >
            <ErrorOutlineIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 600, color: "primary.main" }}>{errorServicio}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando}>
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar comuna"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ShippingFormDialog;
