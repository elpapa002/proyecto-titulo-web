import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import CheckOption from "../../molecules/CheckOption/CheckOption";
import { comunas } from "../../../services/datosPrueba";
import { normalizar } from "../../../utils/formato";

const AddressFormDialog = ({ direccion, direcciones, usuarioId, onCerrar, onGuardar }) => {
  const editando = Boolean(direccion);
  const yaEsPrincipal = Boolean(direccion?.principal);
  const esLaPrimera = !editando && direcciones.length === 0;
  const [datos, setDatos] = useState({
    calle: direccion?.calle ?? "",
    numero: direccion?.numero ?? "",
    comuna: direccion?.comuna ?? "",
    codigoPostal: direccion?.codigoPostal ?? "",
    principal: yaEsPrincipal,
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    let valor = type === "checkbox" ? checked : value;
    if (name === "codigoPostal") valor = value.replace(/\D/g, "").slice(0, 7);
    if (name === "numero") valor = value.toUpperCase();
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    const calle = datos.calle.trim();
    const numero = datos.numero.trim();
    if (!calle) e.calle = "Ingresa la calle.";
    else if (calle.length < 3) e.calle = "La calle debe tener al menos 3 caracteres.";
    else if (calle.length > 80) e.calle = "La calle puede tener hasta 80 caracteres.";
    if (!numero) e.numero = "Ingresa el número.";
    else if (!/^\d{1,6}$/.test(numero) && numero !== "S/N") e.numero = "Usa solo dígitos, o S/N si no tiene número.";
    if (!datos.comuna) e.comuna = "Elige una comuna.";
    if (datos.codigoPostal && datos.codigoPostal.length !== 7) e.codigoPostal = "El código postal tiene 7 dígitos.";
    const repetida = direcciones.some(
      (d) =>
        d.id !== direccion?.id &&
        normalizar(d.calle) === normalizar(calle) &&
        d.numero === numero &&
        d.comuna === datos.comuna
    );
    if (!e.calle && !e.numero && repetida) e.calle = "Ya tienes registrada esta dirección.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosDireccion = {
      usuarioId,
      calle: datos.calle.trim(),
      numero: datos.numero.trim(),
      comuna: datos.comuna,
      codigoPostal: datos.codigoPostal,
      principal: yaEsPrincipal || esLaPrimera || datos.principal,
    };
    console.log(editando ? "Datos para actualizar dirección:" : "Datos para crear dirección:", datosDireccion);

    setGuardando(true);
    await onGuardar(datosDireccion);
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
        <Typography variant="h2">{editando ? "Editar dirección" : "Agregar dirección"}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Dirección donde quieres recibir tus compras. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormField
              label="Calle"
              name="calle"
              required
              placeholder="Av. Juan Mackenna"
              value={datos.calle}
              onChange={cambiar}
              slotProps={{ htmlInput: { maxLength: 80 } }}
              error={Boolean(errores.calle)}
              helperText={errores.calle}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormField
              label="Número"
              name="numero"
              required
              placeholder="1270 o S/N"
              value={datos.numero}
              onChange={cambiar}
              slotProps={{ htmlInput: { maxLength: 6 } }}
              error={Boolean(errores.numero)}
              helperText={errores.numero}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Comuna"
              name="comuna"
              required
              value={datos.comuna}
              onChange={cambiar}
              opciones={comunas.map((c) => ({ valor: c, texto: c }))}
              error={Boolean(errores.comuna)}
              helperText={errores.comuna}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Código postal (opcional)"
              name="codigoPostal"
              placeholder="5290000"
              value={datos.codigoPostal}
              onChange={cambiar}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
              error={Boolean(errores.codigoPostal)}
              helperText={errores.codigoPostal ?? "7 dígitos"}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          {yaEsPrincipal || esLaPrimera ? (
            <Typography variant="body2">
              {esLaPrimera
                ? "Tu primera dirección queda como principal."
                : "Esta es tu dirección principal. Para cambiarla, marca otra dirección como principal."}
            </Typography>
          ) : (
            <CheckOption label="Usar como principal" name="principal" checked={datos.principal} onChange={cambiar} />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddressFormDialog;
