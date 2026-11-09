import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import { DIAS_VIGENCIA } from "../../../services/cotizacionService";
import { formatearPrecio } from "../../../utils/formato";

const MAX_COMENTARIO = 300;
const enteroPositivo = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const QuoteReplyDialog = ({ cotizacion, productos, onCerrar, onGuardar }) => {
  const [precios, setPrecios] = useState(
    Object.fromEntries(cotizacion.items.map((item) => [item.productoId, ""]))
  );
  const [comentario, setComentario] = useState("");
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiarPrecio = (productoId, valor) => {
    setPrecios({ ...precios, [productoId]: valor.replace(/\D/g, "") });
    setErrores({ ...errores, [`precio${productoId}`]: undefined });
  };

  const cambiarComentario = (e) => {
    setComentario(e.target.value);
    setErrores({ ...errores, comentario: undefined });
  };

  const subtotal = (item) => (enteroPositivo(precios[item.productoId]) ? Number(precios[item.productoId]) * item.cantidad : 0);
  const total = cotizacion.items.reduce((suma, item) => suma + subtotal(item), 0);

  const precioReferencia = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? formatearPrecio(producto.precioOferta ?? producto.precio) : "-";
  };

  const validar = () => {
    const e = {};
    cotizacion.items.forEach((item) => {
      if (!enteroPositivo(precios[item.productoId]))
        e[`precio${item.productoId}`] = "Ingresa un precio entero mayor que 0, sin puntos.";
    });
    if (comentario.trim().length > MAX_COMENTARIO) e.comentario = `El comentario puede tener hasta ${MAX_COMENTARIO} caracteres.`;
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosRespuesta = {
      precios: cotizacion.items.map((item) => ({ productoId: item.productoId, precio: Number(precios[item.productoId]) })),
      total,
      comentario: comentario.trim(),
    };
    console.log("Datos para responder cotización:", { id: cotizacion.id, ...datosRespuesta });

    setGuardando(true);
    await onGuardar(datosRespuesta);
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
        <Typography variant="h2">Responder cotización N° {cotizacion.id}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Pedida por {cotizacion.cliente}. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.25, mb: 2 }}>
          <Typography>"{cotizacion.mensaje}"</Typography>
        </Box>

        {cotizacion.items.map((item) => (
          <Box key={item.productoId} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>{item.nombre}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Cantidad: {item.cantidad} · Precio de referencia: {precioReferencia(item.productoId)}
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <FormField
                  label="Tu precio unitario"
                  required
                  placeholder="17500"
                  value={precios[item.productoId]}
                  onChange={(e) => cambiarPrecio(item.productoId, e.target.value)}
                  slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 9 } }}
                  error={Boolean(errores[`precio${item.productoId}`])}
                  helperText={errores[`precio${item.productoId}`] ?? "En pesos, sin puntos"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Subtotal</Typography>
                <Typography sx={{ mt: { xs: 0.5, sm: 1.5 } }}>{formatearPrecio(subtotal(item))}</Typography>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>Total de la cotización</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: "primary.main" }}>{formatearPrecio(total)}</Typography>
        </Box>

        <FormField
          label="Comentario para el cliente (opcional)"
          multiline
          minRows={2}
          placeholder="Plazo de entrega, condiciones, etc."
          value={comentario}
          onChange={cambiarComentario}
          slotProps={{ htmlInput: { maxLength: MAX_COMENTARIO } }}
          error={Boolean(errores.comentario)}
          helperText={errores.comentario ?? `${comentario.length}/${MAX_COMENTARIO} caracteres`}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          La cotización queda vigente por {DIAS_VIGENCIA} días desde que la envías. Después de eso pasa a "Vencida".
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<SendOutlinedIcon />} disabled={guardando}>
          {guardando ? "Enviando..." : "Enviar respuesta"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteReplyDialog;
