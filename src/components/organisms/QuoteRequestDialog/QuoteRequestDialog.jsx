import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import useUser from "../../../contexts/UserContext/useUser";
import { DIAS_VIGENCIA } from "../../../services/cotizacionService";
import { formatearPrecio, hoyIso } from "../../../utils/formato";

const QuoteRequestDialog = ({ producto, onCerrar, onEnviar }) => {
  const { usuario } = useUser();
  const esServicio = producto.tipo === "Servicio";
  const [datos, setDatos] = useState({ cantidad: "", fechaRequerida: "", mensaje: "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: name === "cantidad" ? value.replace(/\D/g, "") : value });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    const cantidad = Number(datos.cantidad);
    if (!/^\d+$/.test(datos.cantidad) || cantidad < 1 || cantidad > 9999)
      e.cantidad = "Ingresa un número entero entre 1 y 9999.";
    if (datos.fechaRequerida && datos.fechaRequerida < hoyIso()) e.fechaRequerida = "La fecha no puede ser pasada.";
    const largo = datos.mensaje.trim().length;
    if (largo < 10) e.mensaje = "Cuéntale al emprendedor qué necesitas, mínimo 10 caracteres.";
    else if (largo > 500) e.mensaje = "El mensaje puede tener como máximo 500 caracteres.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosCotizacion = {
      clienteId: usuario.id,
      vendedorId: producto.vendedorId,
      items: [{ productoId: producto.id, nombre: producto.nombre, cantidad: Number(datos.cantidad) }],
      mensaje: datos.mensaje.trim(),
      fechaRequerida: datos.fechaRequerida || null,
    };
    console.log("Datos para solicitar cotización:", datosCotizacion);

    setEnviando(true);
    await onEnviar(datosCotizacion);
    setEnviando(false);
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
        <Typography variant="h2">Solicitar cotización</Typography>
        <Typography sx={{ mt: 0.5 }}>
          A {producto.tienda}, por {producto.nombre}. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            border: "1px solid",
            borderColor: "text.primary",
            borderRadius: 1,
            p: 1.5,
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>{producto.nombre}</Typography>
          <Typography sx={{ whiteSpace: "nowrap" }}>
            Precio de referencia {formatearPrecio(producto.precioOferta ?? producto.precio)}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label={esServicio ? "Cantidad de cupos" : "Cantidad"}
              name="cantidad"
              required
              placeholder="20"
              value={datos.cantidad}
              onChange={cambiar}
              error={Boolean(errores.cantidad)}
              helperText={errores.cantidad ?? "Número entero entre 1 y 9999"}
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 4 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="¿Para cuándo lo necesitas? (opcional)"
              name="fechaRequerida"
              type="date"
              value={datos.fechaRequerida}
              onChange={cambiar}
              error={Boolean(errores.fechaRequerida)}
              helperText={errores.fechaRequerida ?? "Desde hoy en adelante"}
              slotProps={{ htmlInput: { min: hoyIso() } }}
            />
          </Grid>
        </Grid>
        <FormField
          label="Mensaje para el emprendedor"
          name="mensaje"
          required
          multiline
          minRows={4}
          placeholder="Ej: necesito 20 polerones con el logo de mi club."
          value={datos.mensaje}
          onChange={cambiar}
          error={Boolean(errores.mensaje)}
          helperText={errores.mensaje ?? `Entre 10 y 500 caracteres (${datos.mensaje.trim().length}/500)`}
          slotProps={{ htmlInput: { maxLength: 500 } }}
          sx={{ mt: 2 }}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          El emprendedor responde con sus valores, que se mantienen por {DIAS_VIGENCIA} días. Puedes revisar la respuesta en
          Mis cotizaciones.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<SendOutlinedIcon />} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteRequestDialog;
