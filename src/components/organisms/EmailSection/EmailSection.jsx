import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MailOutlineIcon from "@mui/icons-material/EmailOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import InfoHint from "../../molecules/InfoHint/InfoHint";
import DeleteDialog from "../DeleteDialog/DeleteDialog";
import { crearCorreo, eliminarCorreo, obtenerCorreos } from "../../../services/correoService";
import { correoValido } from "../../../utils/formato";

const MAX_CORREOS = 5;

// correos adicionales; el principal se cambia en "Datos personales"
const EmailSection = ({ usuarioId, correoPrincipal, onAviso }) => {
  const [correos, setCorreos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [nuevo, setNuevo] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCorreos(usuarioId);
      if (respuesta.ok) setCorreos(respuesta.datos);
      else onAviso("No se pudieron cargar tus correos.");
      setCargando(false);
    };
    cargar();
  }, [usuarioId, recargas, onAviso]);

  const agregar = async (evento) => {
    evento.preventDefault();
    const correo = nuevo.trim().toLowerCase();
    if (!correoValido(correo)) return setError("Ingresa un correo válido, por ejemplo nombre@dominio.cl.");
    if (correo === (correoPrincipal ?? "").toLowerCase() || correos.some((c) => c.correo === correo))
      return setError("Ese correo ya está en tu cuenta.");
    const datos = { usuarioId, correo };
    console.log("Datos para agregar correo:", datos);
    setGuardando(true);
    const respuesta = await crearCorreo(datos);
    setGuardando(false);
    if (!respuesta.ok) return setError(respuesta.error);
    setNuevo("");
    setError("");
    onAviso("Correo agregado");
    setRecargas((n) => n + 1);
  };

  const confirmarBorrado = async () => {
    const correo = aBorrar;
    console.log("Correo eliminado:", { id: correo.id, correo: correo.correo });
    const respuesta = await eliminarCorreo(correo.id);
    setABorrar(null);
    if (!respuesta.ok) return onAviso(respuesta.error);
    onAviso("Correo eliminado");
    setRecargas((n) => n + 1);
  };

  const fila = { display: "flex", alignItems: "center", gap: 1.5, py: 1, borderBottom: "1px solid", borderColor: "text.primary" };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Correos
      </Typography>
      <Stack>
        <Box sx={fila}>
          <MailOutlineIcon fontSize="small" />
          <Typography sx={{ flexGrow: 1, wordBreak: "break-all" }}>{correoPrincipal || "Sin correo principal"}</Typography>
          <Typography variant="body2">Principal</Typography>
        </Box>
        {cargando && <Typography sx={{ py: 1.5 }}>Cargando correos...</Typography>}
        {correos.map((c) => (
          <Box key={c.id} sx={fila}>
            <MailOutlineIcon fontSize="small" />
            <Typography sx={{ flexGrow: 1, wordBreak: "break-all" }}>{c.correo}</Typography>
            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => setABorrar(c)} aria-label={`Eliminar ${c.correo}`}>
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>

      {correos.length < MAX_CORREOS && (
        <Box component="form" noValidate onSubmit={agregar} sx={{ display: "flex", gap: 1, alignItems: "flex-start", mt: 2, flexWrap: "wrap" }}>
          <FormField
            label="Otro correo"
            name="correo"
            type="email"
            placeholder="nombre@dominio.cl"
            value={nuevo}
            onChange={(e) => {
              setNuevo(e.target.value);
              setError("");
            }}
            error={Boolean(error)}
            helperText={error}
            sx={{ flex: "1 1 220px" }}
          />
          <CustomButton type="submit" tono="contorno" startIcon={<AddIcon />} disabled={guardando} sx={{ mt: 3.25 }}>
            {guardando ? "Agregando..." : "Agregar correo"}
          </CustomButton>
        </Box>
      )}

      <InfoHint texto="Cada correo puede pertenecer a una sola persona. Puedes tener hasta 5 correos además del principal." sx={{ mt: 2 }} />

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar correo?"
        mensaje={aBorrar ? `Vas a eliminar el correo ${aBorrar.correo} de tu cuenta.` : ""}
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />
    </Paper>
  );
};

export default EmailSection;
