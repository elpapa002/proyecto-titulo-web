import { useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import { formatearPrecio } from "../../../utils/formato";

const MOTIVOS = ["Llegó con un defecto", "No es lo que pedí", "Llegó incompleto", "Otro"];

const unidades = (n) => `${n} ${n === 1 ? "unidad" : "unidades"}`;

const ReturnRequestDialog = ({ venta, onCerrar, onGuardar }) => {
  const variosProductos = venta.items.length > 1;
  const [datos, setDatos] = useState({
    productoId: variosProductos ? "" : venta.items[0].productoId,
    cantidad: "1",
    motivo: "",
    detalle: "",
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);

  const item = venta.items.find((i) => i.productoId === Number(datos.productoId));
  const cantidad = Number(datos.cantidad);
  const cantidadValida = item && Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= item.cantidad;

  const cambiar = (e) => {
    const { name, value } = e.target;
    const valor = name === "cantidad" ? value.replace(/\D/g, "") : value;
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined, ...(name === "productoId" && { cantidad: undefined }) });
    setErrorGeneral("");
  };

  const validar = () => {
    const e = {};
    const detalle = datos.detalle.trim();
    if (!item) e.productoId = "Elige el producto que quieres devolver.";
    else if (!cantidadValida)
      e.cantidad = item.cantidad === 1 ? "Compraste 1 unidad, la cantidad debe ser 1." : `Debe ser un número entero entre 1 y ${item.cantidad}.`;
    if (!datos.motivo) e.motivo = "Elige el motivo de la devolución.";
    if (detalle.length < 10) e.detalle = "Cuéntanos qué pasó, con al menos 10 caracteres.";
    else if (detalle.length > 500) e.detalle = "El detalle puede tener hasta 500 caracteres.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosDevolucion = {
      ventaId: venta.id,
      clienteId: venta.clienteId,
      vendedorId: venta.vendedorId,
      productoId: item.productoId,
      nombreProducto: item.nombre,
      cantidad,
      motivo: datos.motivo,
      detalle: datos.detalle.trim(),
      monto: item.precio * cantidad,
    };
    console.log("Datos para solicitar devolución:", datosDevolucion);

    setGuardando(true);
    const error = await onGuardar(datosDevolucion);
    setGuardando(false);
    if (error) setErrorGeneral(error);
  };

  const medioPago = `${venta.medioPago.tipo} ${venta.medioPago.marca} •••• ${venta.medioPago.ultimos4}`;

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">Solicitar devolución</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Pedido N° {venta.id} · {venta.tienda}. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              {variosProductos ? (
                <SelectField
                  label="Producto que quieres devolver"
                  name="productoId"
                  required
                  value={datos.productoId}
                  onChange={cambiar}
                  opciones={venta.items.map((i) => ({ valor: i.productoId, texto: `${i.nombre} · ${unidades(i.cantidad)}` }))}
                  error={Boolean(errores.productoId)}
                  helperText={errores.productoId}
                />
              ) : (
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Producto</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{venta.items[0].nombre}</Typography>
                  <Typography variant="body2">
                    Compraste {unidades(venta.items[0].cantidad)} · {formatearPrecio(venta.items[0].precio)} c/u
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                label="Cantidad"
                name="cantidad"
                required
                value={datos.cantidad}
                onChange={cambiar}
                slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 3 } }}
                error={Boolean(errores.cantidad)}
                helperText={errores.cantidad ?? (item ? `Máximo ${item.cantidad}` : "Elige un producto")}
              />
            </Grid>
          </Grid>

          <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>
              Motivo de la devolución
              <Box component="span" aria-hidden="true"> *</Box>
            </Typography>
            <RadioGroup name="motivo" value={datos.motivo} onChange={cambiar}>
              {MOTIVOS.map((motivo) => (
                <FormControlLabel
                  key={motivo}
                  value={motivo}
                  label={motivo}
                  control={<Radio size="small" color="primary" />}
                  sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: 14 } }}
                />
              ))}
            </RadioGroup>
            {errores.motivo && (
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
                <ErrorOutlineIcon sx={{ fontSize: 16 }} />
                {errores.motivo}
              </Typography>
            )}
          </Box>

          <FormField
            label="Cuéntanos qué pasó"
            name="detalle"
            required
            multiline
            minRows={3}
            value={datos.detalle}
            onChange={cambiar}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            error={Boolean(errores.detalle)}
            helperText={errores.detalle ?? `${datos.detalle.trim().length}/500 caracteres, mínimo 10`}
          />

          <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography>Reembolso estimado</Typography>
              <Typography sx={{ fontWeight: 600 }}>{cantidadValida ? formatearPrecio(item.precio * cantidad) : "-"}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5 }}>
              <Typography>Se devuelve a</Typography>
              <Typography sx={{ textAlign: "right" }}>{medioPago}</Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              El emprendedor revisa tu solicitud y la aprueba o la rechaza. Si la aprueba, envías el producto de vuelta y
              después se hace el reembolso.
            </Typography>
          </Box>

          {errorGeneral && (
            <Box
              role="alert"
              sx={{ display: "flex", alignItems: "center", gap: 1, border: "2px solid", borderColor: "primary.main", borderRadius: 1, p: 1.5 }}
            >
              <ErrorOutlineIcon fontSize="small" />
              <Typography sx={{ fontWeight: 600 }}>{errorGeneral}</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<UndoIcon />} disabled={guardando}>
          {guardando ? "Enviando..." : "Enviar solicitud"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnRequestDialog;
