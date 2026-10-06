import { useState } from "react";
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, Grid, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import RoleOption from "../../molecules/RoleOption/RoleOption";
import { formatearRut, formatearRutEscritura, limpiarRut, validarRut } from "../../../utils/rut";
import { correoValido, soloLetras } from "../../../utils/formato";

const DOS_MB = 2 * 1024 * 1024;

const UserFormDialog = ({ usuario, usuarios, companias, onCerrar, onGuardar }) => {
  const editando = Boolean(usuario);
  const [datos, setDatos] = useState({
    run: usuario?.run ?? "",
    correo: usuario?.correo ?? "",
    nombres: usuario?.nombres ?? "",
    apellidos: usuario?.apellidos ?? "",
    roles: usuario?.roles ?? ["Cliente"],
    companiaId: usuario?.companiaId ?? "independiente",
    foto: null,
  });
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    let valor = value;
    if (name === "run") valor = formatearRutEscritura(value);
    if (name === "nombres" || name === "apellidos") valor = soloLetras(value);
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const alternarRol = (rol) => {
    const roles = datos.roles.includes(rol) ? datos.roles.filter((r) => r !== rol) : [...datos.roles, rol];
    setDatos({ ...datos, roles });
    setErrores({ ...errores, roles: undefined });
  };

  const subirFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      setErrores({ ...errores, foto: "La foto debe ser JPG o PNG." });
      return;
    }
    if (archivo.size > DOS_MB) {
      setErrores({ ...errores, foto: "La foto no puede pesar más de 2 MB." });
      return;
    }
    setErrores({ ...errores, foto: undefined });
    setDatos({ ...datos, foto: archivo });
    setVistaPrevia(URL.createObjectURL(archivo));
  };

  const validar = () => {
    const e = {};
    const otros = usuarios.filter((u) => u.id !== usuario?.id);
    if (!editando) {
      if (!validarRut(datos.run)) e.run = "RUN no válido. Revisa el dígito verificador.";
      else if (otros.some((u) => limpiarRut(u.run) === limpiarRut(datos.run))) e.run = "Ya existe un usuario con este RUN.";
    }
    if (!correoValido(datos.correo)) e.correo = "Correo no válido.";
    else if (otros.some((u) => u.correo.toLowerCase() === datos.correo.trim().toLowerCase()))
      e.correo = "Este correo ya pertenece a otra persona.";
    if (datos.nombres.trim().length < 2) e.nombres = "Ingresa los nombres, solo letras.";
    if (datos.apellidos.trim().length < 2) e.apellidos = "Ingresa los apellidos, solo letras.";
    if (datos.roles.length === 0) e.roles = "Elige al menos un rol.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const esVendedor = datos.roles.includes("Vendedor");
    const datosUsuario = {
      run: formatearRut(datos.run),
      correo: datos.correo.trim().toLowerCase(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      roles: datos.roles,
      companiaId: esVendedor && datos.companiaId !== "independiente" ? Number(datos.companiaId) : null,
      foto: datos.foto ? datos.foto.name : null,
    };
    console.log(editando ? "Datos para actualizar usuario:" : "Datos para crear usuario:", datosUsuario);

    setGuardando(true);
    await onGuardar(datosUsuario);
    setGuardando(false);
  };

  const companiaElegida = companias.find((c) => c.id === Number(datos.companiaId));
  const opcionesRol = [
    { rol: "Cliente", titulo: "Es comprador", detalle: "Cliente" },
    { rol: "Vendedor", titulo: "Es vendedor", detalle: companiaElegida?.nombre ?? "Compañía independiente" },
    { rol: "Admin", titulo: "Admin", detalle: "Administrador del sistema" },
  ];
  const opcionesCompania = [{ valor: "independiente", texto: "Compañía independiente" }].concat(
    companias.map((c) => ({ valor: c.id, texto: c.nombre }))
  );
  const bordePunteado = { "& .Mui-disabled .MuiOutlinedInput-notchedOutline": { borderStyle: "dashed" } };

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">{editando ? "Editar usuario" : "Agregar nuevo usuario"}</Typography>
        <Typography sx={{ mt: 0.5 }}>Completa los datos y elige uno o más roles. Los campos con * son obligatorios.</Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1.5,
            border: "1px solid",
            borderColor: "text.primary",
            borderRadius: 1.5,
          }}
        >
          <Avatar
            src={vistaPrevia ?? undefined}
            sx={{ width: 56, height: 56, bgcolor: "secondary.main", color: "text.primary", border: "1px solid" }}
          >
            <PhotoCameraOutlinedIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>Foto de perfil</Typography>
            <Typography variant="body2">
              {errores.foto ?? (datos.foto ? datos.foto.name : "JPG o PNG de hasta 2 MB")}
            </Typography>
          </Box>
          <Button component="label" variant="outlined" startIcon={<FileUploadOutlinedIcon />}>
            Subir foto
            <Box component="input" hidden type="file" accept="image/png,image/jpeg" onChange={subirFoto} />
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="RUN"
              name="run"
              placeholder="21.034.567-1"
              value={datos.run}
              onChange={cambiar}
              required={!editando}
              slotProps={{ htmlInput: { maxLength: 12 } }}
              disabled={editando}
              error={Boolean(errores.run)}
              helperText={errores.run ?? (editando ? "El RUN no se puede modificar" : "Con dígito verificador")}
              sx={bordePunteado}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Correo"
              name="correo"
              type="email"
              placeholder="correo@gmail.com"
              value={datos.correo}
              onChange={cambiar}
              required
              error={Boolean(errores.correo)}
              helperText={errores.correo}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Nombres"
              name="nombres"
              value={datos.nombres}
              onChange={cambiar}
              required
              error={Boolean(errores.nombres)}
              helperText={errores.nombres}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              label="Apellidos"
              name="apellidos"
              value={datos.apellidos}
              onChange={cambiar}
              required
              error={Boolean(errores.apellidos)}
              helperText={errores.apellidos}
            />
          </Grid>
        </Grid>

        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 600 }}>Rol *</Typography>
          {opcionesRol.map((opcion) => (
            <RoleOption
              key={opcion.rol}
              titulo={opcion.titulo}
              detalle={opcion.detalle}
              marcado={datos.roles.includes(opcion.rol)}
              onChange={() => alternarRol(opcion.rol)}
            />
          ))}
          {errores.roles && (
            <Typography variant="body2" color="error" role="alert">
              {errores.roles}
            </Typography>
          )}
        </Stack>

        <SelectField
          label="Compañía (solo vendedores)"
          name="companiaId"
          value={datos.companiaId}
          onChange={cambiar}
          opciones={opcionesCompania}
          disabled={!datos.roles.includes("Vendedor")}
          sx={bordePunteado}
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

export default UserFormDialog;
