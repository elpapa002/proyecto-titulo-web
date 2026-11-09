import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, IconButton, Rating, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarOutlineIcon from "@mui/icons-material/StarOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";

const etiquetas = { 1: "Muy malo", 2: "Malo", 3: "Regular", 4: "Bueno", 5: "Excelente" };

const CampoNota = ({ label, name, valor, error, onCambiar }) => (
  <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
    <Typography component="legend" sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>
      {label}
      <Box component="span" aria-hidden="true"> *</Box>
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Rating
        name={name}
        value={valor}
        onChange={(_, nuevo) => onCambiar(name, nuevo)}
        sx={{ color: "primary.main" }}
        emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: "primary.main" }} />}
      />
      <Typography>{valor ? etiquetas[valor] : "Sin nota"}</Typography>
    </Box>
    {error && (
      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, mt: 0.5 }}>
        <ErrorOutlineIcon sx={{ fontSize: 16 }} />
        {error}
      </Typography>
    )}
  </Box>
);

const RatingDialog = ({ venta, onCerrar, onGuardar }) => {
  const variosProductos = venta.items.length > 1;
  const [datos, setDatos] = useState({
    productoId: variosProductos ? "" : venta.items[0].productoId,
    notaProducto: null,
    notaVendedor: null,
    comentario: "",
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiarValor = (name, valor) => {
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    const comentario = datos.comentario.trim();
    if (!datos.productoId) e.productoId = "Elige el producto que quieres calificar.";
    if (!datos.notaProducto) e.notaProducto = "Elige una nota de 1 a 5 para el producto.";
    if (!datos.notaVendedor) e.notaVendedor = "Elige una nota de 1 a 5 para el vendedor.";
    if (comentario.length < 10) e.comentario = "Escribe un comentario de al menos 10 caracteres.";
    else if (comentario.length > 300) e.comentario = "El comentario puede tener hasta 300 caracteres.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosCalificacion = {
      ventaId: venta.id,
      productoId: Number(datos.productoId),
      vendedorId: venta.vendedorId,
      clienteId: venta.clienteId,
      notaProducto: datos.notaProducto,
      notaVendedor: datos.notaVendedor,
      comentario: datos.comentario.trim(),
    };
    console.log("Datos para calificar compra:", datosCalificacion);

    setGuardando(true);
    await onGuardar(datosCalificacion);
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
        <Typography variant="h2">Califica tu compra</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Pedido N° {venta.id} · {venta.tienda}. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Stack spacing={2.5}>
          {variosProductos ? (
            <SelectField
              label="Producto que quieres calificar"
              name="productoId"
              required
              value={datos.productoId}
              onChange={(e) => cambiarValor("productoId", e.target.value)}
              opciones={venta.items.map((item) => ({ valor: item.productoId, texto: item.nombre }))}
              error={Boolean(errores.productoId)}
              helperText={errores.productoId}
            />
          ) : (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Producto</Typography>
              <Typography sx={{ fontWeight: 600 }}>{venta.items[0].nombre}</Typography>
            </Box>
          )}
          <CampoNota
            label="Nota del producto"
            name="notaProducto"
            valor={datos.notaProducto}
            error={errores.notaProducto}
            onCambiar={cambiarValor}
          />
          <CampoNota
            label={`Nota del vendedor (${venta.tienda})`}
            name="notaVendedor"
            valor={datos.notaVendedor}
            error={errores.notaVendedor}
            onCambiar={cambiarValor}
          />
          <FormField
            label="Comentario"
            name="comentario"
            required
            multiline
            minRows={3}
            placeholder="Cuéntanos qué te pareció el producto y la atención"
            value={datos.comentario}
            onChange={(e) => cambiarValor("comentario", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 300 } }}
            error={Boolean(errores.comentario)}
            helperText={errores.comentario ?? `${datos.comentario.trim().length}/300 caracteres, mínimo 10`}
          />
          <Typography variant="body2">
            Tu calificación se muestra en la ficha del producto y en el perfil del emprendedor. Cada compra se califica
            una sola vez.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<StarOutlineIcon />} disabled={guardando}>
          {guardando ? "Enviando..." : "Publicar"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
