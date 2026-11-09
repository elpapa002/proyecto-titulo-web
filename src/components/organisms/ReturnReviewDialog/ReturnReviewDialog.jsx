import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { formatearPrecio } from "../../../utils/formato";

const MIN_RESPUESTA = 10;
const MAX_RESPUESTA = 300;

const ReturnReviewDialog = ({ devolucion, onCerrar, onGuardar }) => {
  const [datos, setDatos] = useState({ estado: "", respuesta: "", reponerStock: true });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const aprueba = datos.estado === "Aprobada";

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    const respuesta = datos.respuesta.trim();
    if (!datos.estado) e.estado = "Elige si apruebas o rechazas la devolución.";
    if (!respuesta) e.respuesta = "Escribe una respuesta para el cliente.";
    else if (respuesta.length < MIN_RESPUESTA) e.respuesta = `La respuesta debe tener al menos ${MIN_RESPUESTA} caracteres.`;
    else if (respuesta.length > MAX_RESPUESTA) e.respuesta = `La respuesta puede tener hasta ${MAX_RESPUESTA} caracteres.`;
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosResolucion = {
      estado: datos.estado,
      respuesta: datos.respuesta.trim(),
      reponerStock: aprueba && datos.reponerStock,
    };
    console.log("Datos para resolver devolución:", { id: devolucion.id, ...datosResolucion });

    setGuardando(true);
    await onGuardar(datosResolucion);
    setGuardando(false);
  };

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">Evaluar devolución N° {devolucion.id}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          {devolucion.nombreProducto} × {devolucion.cantidad} de {devolucion.cliente}. Los campos marcados con * son
          obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.25, mb: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>{devolucion.motivo}</Typography>
          <Typography>"{devolucion.detalle}"</Typography>
        </Box>

        <SelectField
          label="Decisión"
          name="estado"
          required
          value={datos.estado}
          onChange={cambiar}
          opciones={[
            { valor: "Aprobada", texto: "Aprobar la devolución" },
            { valor: "Rechazada", texto: "Rechazar la devolución" },
          ]}
          error={Boolean(errores.estado)}
          helperText={errores.estado}
        />

        {aprueba && (
          <Box sx={{ mt: 2 }}>
            <Typography>
              Monto a reembolsar: <strong>{formatearPrecio(devolucion.monto)}</strong>
            </Typography>
            <Box sx={{ mt: 1 }}>
              <CheckOption
                name="reponerStock"
                label="Reponer el stock del producto"
                checked={datos.reponerStock}
                onChange={(e) => setDatos({ ...datos, reponerStock: e.target.checked })}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {datos.reponerStock
                ? `${devolucion.cantidad === 1 ? "Se suma 1 unidad" : `Se suman ${devolucion.cantidad} unidades`} al stock de ${devolucion.nombreProducto}.`
                : "Déjala sin marcar si el producto llegó dañado y no se puede volver a vender."}
            </Typography>
          </Box>
        )}

        <FormField
          label="Respuesta para el cliente"
          name="respuesta"
          required
          multiline
          minRows={3}
          placeholder="Cuéntale al cliente qué decidiste y los pasos a seguir."
          value={datos.respuesta}
          onChange={cambiar}
          slotProps={{ htmlInput: { maxLength: MAX_RESPUESTA } }}
          error={Boolean(errores.respuesta)}
          helperText={errores.respuesta ?? `${datos.respuesta.length}/${MAX_RESPUESTA} caracteres, mínimo ${MIN_RESPUESTA}`}
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar decisión"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnReviewDialog;
