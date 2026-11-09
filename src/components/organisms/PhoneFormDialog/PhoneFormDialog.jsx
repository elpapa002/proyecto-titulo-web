import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";

const sinEspacios = (numero) => numero.replace(/\s/g, "");

const PhoneFormDialog = ({ telefono, telefonos, usuarioId, onCerrar, onGuardar }) => {
  const editando = Boolean(telefono);
  const [numero, setNumero] = useState(telefono?.numero ?? "");
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    setNumero(e.target.value.replace(/[^\d+\s]/g, ""));
    setErrores({ ...errores, numero: undefined });
  };

  const validar = () => {
    const e = {};
    const limpio = sinEspacios(numero);
    if (!limpio) e.numero = "Ingresa el número de teléfono.";
    else if (!/^\+569\d{8}$/.test(limpio)) e.numero = "Debe ser +56 9 seguido de 8 dígitos.";
    else if (telefonos.some((t) => t.id !== telefono?.id && sinEspacios(t.numero) === limpio))
      e.numero = "Ya tienes registrado este teléfono.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const limpio = sinEspacios(numero);
    const datosTelefono = { usuarioId, numero: `+56 9 ${limpio.slice(4, 8)} ${limpio.slice(8)}` };
    console.log(editando ? "Datos para actualizar teléfono:" : "Datos para crear teléfono:", datosTelefono);

    setGuardando(true);
    const error = await onGuardar(datosTelefono);
    setGuardando(false);
    if (error) setErrores({ numero: error });
  };

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">{editando ? "Editar teléfono" : "Agregar teléfono"}</Typography>
        <Typography sx={{ mt: 0.5 }}>Los campos marcados con * son obligatorios.</Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <FormField
          label="Número de celular"
          name="numero"
          required
          type="tel"
          placeholder="+56 9 1234 5678"
          value={numero}
          onChange={cambiar}
          slotProps={{ htmlInput: { maxLength: 16 } }}
          error={Boolean(errores.numero)}
          helperText={errores.numero ?? "+56 9 y 8 dígitos, con o sin espacios"}
        />
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

export default PhoneFormDialog;
