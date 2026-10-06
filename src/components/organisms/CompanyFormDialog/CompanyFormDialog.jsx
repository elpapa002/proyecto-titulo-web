import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import { formatearRut, formatearRutEscritura, limpiarRut, validarRut } from "../../../utils/rut";
import { correoValido } from "../../../utils/formato";

const CompanyFormDialog = ({ compania, companias, onCerrar, onGuardar }) => {
  const editando = Boolean(compania);
  const [datos, setDatos] = useState({
    rut: compania?.rut ?? "",
    nombre: compania?.nombre ?? "",
    personas: compania?.personas ?? "",
    telefono: compania?.telefono ?? "",
    correo: compania?.correo ?? "",
    sitioWeb: compania?.sitioWeb ?? "",
    direccion: compania?.direccion ?? "",
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: name === "rut" ? formatearRutEscritura(value) : value });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    if (!editando) {
      if (!validarRut(datos.rut)) e.rut = "RUT no válido. Revisa el dígito verificador.";
      else if (companias.some((c) => limpiarRut(c.rut) === limpiarRut(datos.rut)))
        e.rut = "Ya existe una compañía con este RUT.";
    }
    if (!datos.nombre.trim()) e.nombre = "Ingresa el nombre de la empresa.";
    if (!(Number(datos.personas) >= 1)) e.personas = "Debe ser 1 o más.";
    if (datos.telefono.replace(/\D/g, "").length < 8) e.telefono = "Ingresa un teléfono válido.";
    if (!correoValido(datos.correo)) e.correo = "Correo no válido.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosCompania = {
      rut: formatearRut(datos.rut),
      nombre: datos.nombre.trim(),
      personas: Number(datos.personas),
      telefono: datos.telefono.trim(),
      correo: datos.correo.trim().toLowerCase(),
      sitioWeb: datos.sitioWeb.trim(),
      direccion: datos.direccion.trim(),
    };
    console.log(editando ? "Datos para actualizar compañía:" : "Datos para crear compañía:", datosCompania);

    setGuardando(true);
    await onGuardar(datosCompania);
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
        <Typography variant="h2">{editando ? "Editar compañía" : "Agregar compañía"}</Typography>
        <Typography sx={{ mt: 0.5 }}>Datos de la empresa de un emprendedor. Los campos con * son obligatorios.</Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="RUT de la empresa"
              name="rut"
              placeholder="76.543.210-3"
              value={datos.rut}
              onChange={cambiar}
              required={!editando}
              slotProps={{ htmlInput: { maxLength: 12 } }}
              disabled={editando}
              error={Boolean(errores.rut)}
              helperText={errores.rut ?? (editando ? "El RUT no se puede modificar" : "Con dígito verificador")}
              sx={{ "& .Mui-disabled .MuiOutlinedInput-notchedOutline": { borderStyle: "dashed" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Nombre de la empresa"
              name="nombre"
              required
              value={datos.nombre}
              onChange={cambiar}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Número de personas"
              name="personas"
              required
              type="number"
              value={datos.personas}
              onChange={cambiar}
              error={Boolean(errores.personas)}
              helperText={errores.personas}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Teléfono"
              name="telefono"
              required
              placeholder="+56 64 223 4567"
              value={datos.telefono}
              onChange={cambiar}
              error={Boolean(errores.telefono)}
              helperText={errores.telefono}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Correo de contacto"
              name="correo"
              required
              type="email"
              value={datos.correo}
              onChange={cambiar}
              error={Boolean(errores.correo)}
              helperText={errores.correo}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField label="Sitio web (opcional)" name="sitioWeb" value={datos.sitioWeb} onChange={cambiar} />
          </Grid>
        </Grid>
        <FormField
          label="Dirección del local (opcional)"
          name="direccion"
          value={datos.direccion}
          onChange={cambiar}
          sx={{ mt: 2 }}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          El emprendedor se asigna desde Gestión de usuarios, en el campo «Compañía».
        </Typography>
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

export default CompanyFormDialog;
