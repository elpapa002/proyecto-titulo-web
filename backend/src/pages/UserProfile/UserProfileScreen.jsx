import { useEffect, useState } from "react";
import { Avatar, Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import CustomButton from "../../components/atoms/Button/CustomButton";
import RoleChip from "../../components/atoms/RoleChip/RoleChip";
import FormField from "../../components/molecules/FormField/FormField";
import PasswordField from "../../components/molecules/PasswordField/PasswordField";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { actualizarPerfil, cambiarClave, obtenerUsuarios } from "../../services/userService";
import { obtenerCompanias } from "../../services/companyService";
import {
  calcularEdad,
  correoValido,
  errorFechaNacimiento,
  formatearFecha,
  hoyIso,
  iniciales,
  nombreCompania,
  soloLetras,
} from "../../utils/formato";
import { encriptarClave } from "../../utils/clave";

const tarjeta = { p: 3, borderRadius: 1.5, borderColor: "text.primary" };

const UserProfileScreen = () => {
  const { usuario, actualizarUsuarioSesion } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [companias, setCompanias] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const [respuestaUsuarios, respuestaCompanias] = await Promise.all([obtenerUsuarios(), obtenerCompanias()]);
      if (respuestaUsuarios.ok) setUsuarios(respuestaUsuarios.datos);
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
    };
    cargar();
  }, []);

  const [perfil, setPerfil] = useState({
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo: usuario.correo ?? "",
    fechaNacimiento: usuario.fechaNacimiento ?? "",
  });
  const [claves, setClaves] = useState({ actual: "", nueva: "", repetida: "" });
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState("");

  const cambiarPerfil = (e) => {
    const { name, value } = e.target;
    const valor = name === "nombres" || name === "apellidos" ? soloLetras(value) : value;
    setPerfil({ ...perfil, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };
  const cambiarClaves = (e) => {
    setClaves({ ...claves, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: undefined });
  };

  const guardarPerfil = async (evento) => {
    evento.preventDefault();
    const e = {};
    if (perfil.nombres.trim().length < 2) e.nombres = "Ingresa tus nombres, solo letras.";
    if (perfil.apellidos.trim().length < 2) e.apellidos = "Ingresa tus apellidos, solo letras.";
    if (perfil.fechaNacimiento && errorFechaNacimiento(perfil.fechaNacimiento))
      e.fechaNacimiento = errorFechaNacimiento(perfil.fechaNacimiento);
    if (!correoValido(perfil.correo)) e.correo = "Correo no válido.";
    else if (usuarios.some((u) => u.id !== usuario.id && u.correo.toLowerCase() === perfil.correo.toLowerCase()))
      e.correo = "Este correo ya pertenece a otra persona.";
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const datosPerfil = {
      nombres: perfil.nombres.trim(),
      apellidos: perfil.apellidos.trim(),
      correo: perfil.correo.trim().toLowerCase(),
      fechaNacimiento: perfil.fechaNacimiento,
    };
    console.log("Datos para actualizar perfil:", { run: usuario.run, ...datosPerfil });

    const respuesta = await actualizarPerfil(usuario.id, datosPerfil);
    if (!respuesta.ok) return;
    actualizarUsuarioSesion(datosPerfil);
    setAviso("Tus datos se guardaron");
  };

  const guardarClave = async (evento) => {
    evento.preventDefault();
    const e = {};
    if (!claves.actual) e.actual = "Ingresa tu clave actual.";
    if (claves.nueva.length < 8) e.nueva = "La clave nueva debe tener al menos 8 caracteres.";
    if (claves.repetida !== claves.nueva) e.repetida = "Las claves no coinciden.";
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const datosClave = {
      run: usuario.run,
      claveActual: await encriptarClave(claves.actual),
      claveNueva: await encriptarClave(claves.nueva),
    };
    console.log("Datos para cambiar clave:", datosClave);

    const respuesta = await cambiarClave(usuario.id, datosClave);
    if (!respuesta.ok) return;
    setClaves({ actual: "", nueva: "", repetida: "" });
    setAviso("Tu clave se cambió");
  };

  const edad = calcularEdad(usuario.fechaNacimiento);

  return (
    <>
      <PageHeader titulo="Mi perfil" subtitulo="Revisa y actualiza tus datos y tu clave de acceso. Los campos con * son obligatorios." />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ ...tarjeta, textAlign: "center" }}>
            <Avatar sx={{ width: 88, height: 88, mx: "auto", bgcolor: "primary.main", fontSize: 30 }}>
              {iniciales(usuario)}
            </Avatar>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {usuario.nombres} {usuario.apellidos}
            </Typography>
            <Typography sx={{ mt: 0.5 }}>
              RUN {usuario.run}
              {edad !== null && ` · ${edad} años`}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              {usuario.roles.map((rol) => (
                <RoleChip key={rol} rol={rol} />
              ))}
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Stack spacing={1.5} sx={{ textAlign: "left" }}>
              <Box>
                <Typography variant="body2">Correo</Typography>
                <Typography sx={{ fontWeight: 600, wordBreak: "break-all" }}>{usuario.correo || "Sin correo"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Fecha de ingreso</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatearFecha(usuario.fechaIngreso) || "Hoy"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Compañía</Typography>
                <Typography sx={{ fontWeight: 600 }}>{nombreCompania(usuario, companias)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" component="form" onSubmit={guardarPerfil} noValidate sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Datos personales
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Nombres"
                    name="nombres"
                    value={perfil.nombres}
                    onChange={cambiarPerfil}
                    required
                    error={Boolean(errores.nombres)}
                    helperText={errores.nombres}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Apellidos"
                    name="apellidos"
                    value={perfil.apellidos}
                    onChange={cambiarPerfil}
                    required
                    error={Boolean(errores.apellidos)}
                    helperText={errores.apellidos}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="RUN"
                    value={usuario.run}
                    disabled
                    helperText="El RUN no se puede modificar"
                    sx={{ "& .Mui-disabled .MuiOutlinedInput-notchedOutline": { borderStyle: "dashed" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Fecha de nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={perfil.fechaNacimiento}
                    onChange={cambiarPerfil}
                    error={Boolean(errores.fechaNacimiento)}
                    helperText={errores.fechaNacimiento}
                    slotProps={{ htmlInput: { min: "1900-01-01", max: hoyIso() } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Correo"
                    name="correo"
                    type="email"
                    value={perfil.correo}
                    onChange={cambiarPerfil}
                    required
                    error={Boolean(errores.correo)}
                    helperText={errores.correo}
                  />
                </Grid>
              </Grid>
              <CustomButton type="submit" sx={{ mt: 2.5 }}>
                Guardar cambios
              </CustomButton>
            </Paper>

            <Paper variant="outlined" component="form" onSubmit={guardarClave} noValidate sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Clave de acceso
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <PasswordField
                    label="Clave actual"
                    name="actual"
                    required
                    value={claves.actual}
                    onChange={cambiarClaves}
                    error={Boolean(errores.actual)}
                    helperText={errores.actual}
                    autoComplete="current-password"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <PasswordField
                    label="Nueva clave"
                    name="nueva"
                    required
                    value={claves.nueva}
                    onChange={cambiarClaves}
                    error={Boolean(errores.nueva)}
                    helperText={errores.nueva ?? "Mínimo 8 caracteres"}
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <PasswordField
                    label="Repite la nueva clave"
                    name="repetida"
                    required
                    value={claves.repetida}
                    onChange={cambiarClaves}
                    error={Boolean(errores.repetida)}
                    helperText={errores.repetida}
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>
              <CustomButton tono="contorno" type="submit" startIcon={<LockOutlinedIcon />} sx={{ mt: 2.5 }}>
                Cambiar clave
              </CustomButton>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default UserProfileScreen;
