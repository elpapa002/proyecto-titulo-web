import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { formatearFecha, formatearPrecio, hoyIso, porcentajeDescuento } from "../../../utils/formato";

const MAXIMO_DIAS = 90;

const fechaValida = (fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha);

const diasEntre = (inicio, fin) =>
  Math.round((new Date(`${fin}T00:00:00`) - new Date(`${inicio}T00:00:00`)) / 86400000) + 1;

const OfferFormDialog = ({ oferta, productos, onCerrar, onGuardar }) => {
  const editando = Boolean(oferta);
  const [datos, setDatos] = useState({
    productoId: oferta?.productoId ?? "",
    precioOferta: oferta ? String(oferta.precioOferta) : "",
    inicio: oferta?.inicio ?? hoyIso(),
    fin: oferta?.fin ?? "",
    difundir: true,
  });
  const [errores, setErrores] = useState({});
  const [errorServicio, setErrorServicio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const opciones = productos
    .filter((p) => p.estado === "Publicada" || p.id === oferta?.productoId)
    .map((p) => ({ valor: p.id, texto: p.nombre }));
  const producto = productos.find((p) => p.id === datos.productoId);
  const precioNormal = producto?.precio ?? oferta?.precio ?? 0;

  const precioEscrito = datos.precioOferta.trim();
  const numeroEscrito = Number(precioEscrito);
  const descuento =
    precioNormal && /^\d+$/.test(precioEscrito) && numeroEscrito > 0 && numeroEscrito < precioNormal
      ? porcentajeDescuento({ precio: precioNormal, precioOferta: numeroEscrito })
      : null;

  const fechasCoherentes = fechaValida(datos.inicio) && fechaValida(datos.fin) && datos.fin >= datos.inicio;
  const duracion = fechasCoherentes ? diasEntre(datos.inicio, datos.fin) : 0;
  const cambiaronFechas = !editando || datos.inicio !== oferta.inicio || datos.fin !== oferta.fin;

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: undefined });
    setErrorServicio("");
  };

  const validar = () => {
    const e = {};
    if (!datos.productoId) e.productoId = "Elige la publicación que tendrá la oferta.";

    if (!precioEscrito) e.precioOferta = "Ingresa el precio de oferta.";
    else if (!/^\d+$/.test(precioEscrito)) e.precioOferta = "Debe ser un número entero, sin puntos ni decimales.";
    else if (numeroEscrito <= 0) e.precioOferta = "Debe ser mayor a $0.";
    else if (precioNormal && numeroEscrito >= precioNormal)
      e.precioOferta = `Debe ser menor al precio normal (${formatearPrecio(precioNormal)}).`;
    else if (descuento !== null && descuento < 1) e.precioOferta = "El descuento debe ser de al menos 1%.";

    if (!datos.inicio) e.inicio = "Ingresa la fecha de inicio.";
    else if (!fechaValida(datos.inicio)) e.inicio = "Fecha no válida.";

    if (!datos.fin) e.fin = "Ingresa la fecha de término.";
    else if (!fechaValida(datos.fin)) e.fin = "Fecha no válida.";
    else if (fechaValida(datos.inicio) && datos.fin < datos.inicio)
      e.fin = "No puede ser anterior a la fecha de inicio.";
    else if (!editando && datos.fin < hoyIso()) e.fin = "La fecha de término no puede estar en el pasado.";
    else if (fechaValida(datos.inicio) && cambiaronFechas && duracion > MAXIMO_DIAS)
      e.fin = `La oferta puede durar como máximo ${MAXIMO_DIAS} días (ahora son ${duracion}).`;
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosOferta = {
      productoId: datos.productoId,
      precioOferta: numeroEscrito,
      inicio: datos.inicio,
      fin: datos.fin,
      ...(!editando && { difundir: datos.difundir }),
    };

    setGuardando(true);
    const error = await onGuardar(datosOferta);
    setGuardando(false);
    if (error) setErrorServicio(error);
  };

  const ayudaPrecio =
    descuento !== null
      ? `Descuento de ${descuento}%`
      : precioNormal
        ? `Debe ser menor a ${formatearPrecio(precioNormal)}`
        : "Primero elige la publicación";

  const ayudaFin = duracion
    ? `Dura ${duracion} ${duracion === 1 ? "día" : "días"}. El ${formatearFecha(datos.fin)} a las 23:59 vuelve al precio normal.`
    : `Máximo ${MAXIMO_DIAS} días de duración.`;

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">{editando ? "Editar oferta" : "Crear oferta"}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Define un precio de oferta por un tiempo. Cuando termina, la publicación vuelve sola a su precio normal.
          Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <SelectField
          label="Publicación"
          name="productoId"
          required={!editando}
          value={datos.productoId}
          onChange={cambiar}
          opciones={opciones}
          disabled={editando}
          error={Boolean(errores.productoId)}
          helperText={
            errores.productoId ??
            (editando
              ? "La publicación no se puede cambiar. Si necesitas otra, crea una oferta nueva."
              : opciones.length === 0
                ? "No tienes publicaciones publicadas."
                : "Solo aparecen tus publicaciones publicadas.")
          }
          sx={{ "& .Mui-disabled .MuiOutlinedInput-notchedOutline": { borderStyle: "dashed" } }}
        />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Precio normal"
              value={precioNormal ? formatearPrecio(precioNormal) : ""}
              placeholder="Según la publicación"
              disabled
              helperText="Se toma de la publicación"
              sx={{ "& .Mui-disabled .MuiOutlinedInput-notchedOutline": { borderStyle: "dashed" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Precio de oferta"
              name="precioOferta"
              required
              type="number"
              placeholder="19990"
              value={datos.precioOferta}
              onChange={cambiar}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              error={Boolean(errores.precioOferta)}
              helperText={errores.precioOferta ?? ayudaPrecio}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Fecha de inicio"
              name="inicio"
              required
              type="date"
              value={datos.inicio}
              onChange={cambiar}
              error={Boolean(errores.inicio)}
              helperText={errores.inicio ?? "Desde las 00:00 de ese día"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Fecha de término"
              name="fin"
              required
              type="date"
              value={datos.fin}
              onChange={cambiar}
              slotProps={{ htmlInput: { min: editando || datos.inicio > hoyIso() ? datos.inicio : hoyIso() } }}
              error={Boolean(errores.fin)}
              helperText={errores.fin ?? ayudaFin}
            />
          </Grid>
        </Grid>

        {editando ? (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {oferta.difundir
              ? "Cuando creaste esta oferta se les avisó a tus clientes."
              : "Esta oferta se creó sin avisar a tus clientes."}
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <CheckOption
              name="difundir"
              label="Avisar a mis clientes"
              checked={datos.difundir}
              onChange={(e) => setDatos({ ...datos, difundir: e.target.checked })}
            />
            <Typography variant="body2" sx={{ mt: 0.5, pl: 4 }}>
              Les llega un aviso en la tienda con el precio de oferta.
            </Typography>
          </Box>
        )}

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
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear oferta"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default OfferFormDialog;
