import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import InfoHint from "../../molecules/InfoHint/InfoHint";
import PhoneFormDialog from "../PhoneFormDialog/PhoneFormDialog";
import DeleteDialog from "../DeleteDialog/DeleteDialog";
import {
  actualizarTelefono,
  crearTelefono,
  eliminarTelefono,
  obtenerTelefonos,
} from "../../../services/direccionService";

const PhoneSection = ({ usuarioId, onAviso }) => {
  const [telefonos, setTelefonos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerTelefonos(usuarioId);
      if (respuesta.ok) setTelefonos(respuesta.datos);
      else onAviso("No se pudieron cargar tus teléfonos.");
      setCargando(false);
    };
    cargar();
  }, [usuarioId, recargas, onAviso]);

  const guardar = async (datos) => {
    const original = formulario.telefono;
    const respuesta = original ? await actualizarTelefono(original.id, datos) : await crearTelefono(datos);
    if (!respuesta.ok) return respuesta.error;
    onAviso(original ? "Teléfono actualizado" : "Teléfono agregado");
    setFormulario(null);
    setRecargas((n) => n + 1);
    return "";
  };

  const confirmarBorrado = async () => {
    const telefono = aBorrar;
    console.log("Teléfono eliminado:", { id: telefono.id, numero: telefono.numero });
    const respuesta = await eliminarTelefono(telefono.id);
    setABorrar(null);
    if (!respuesta.ok) {
      onAviso(respuesta.error);
      return;
    }
    onAviso("Teléfono eliminado");
    setRecargas((n) => n + 1);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1 }}>
        <Typography variant="h3">Teléfonos</Typography>
        <CustomButton tono="contorno" startIcon={<AddIcon />} onClick={() => setFormulario({ telefono: null })}>
          Agregar teléfono
        </CustomButton>
      </Box>

      <Stack>
        {telefonos.length === 0 && (
          <Typography sx={{ py: 1.5 }}>{cargando ? "Cargando teléfonos..." : "Todavía no tienes teléfonos registrados."}</Typography>
        )}
        {telefonos.map((t) => (
          <Box
            key={t.id}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1, borderBottom: "1px solid", borderColor: "text.primary" }}
          >
            <PhoneOutlinedIcon fontSize="small" />
            <Typography sx={{ flexGrow: 1 }}>{t.numero}</Typography>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => setFormulario({ telefono: t })} aria-label={`Editar ${t.numero}`}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => setABorrar(t)} aria-label={`Eliminar ${t.numero}`}>
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>

      <InfoHint
        texto="Cada teléfono puede pertenecer a una sola persona. Si ya está registrado por otra cuenta, te avisamos."
        sx={{ mt: 2 }}
      />

      {formulario && (
        <PhoneFormDialog
          telefono={formulario.telefono}
          telefonos={telefonos}
          usuarioId={usuarioId}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar teléfono?"
        mensaje={aBorrar ? `Vas a eliminar el teléfono ${aBorrar.numero}. Esta acción no se puede deshacer.` : ""}
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />
    </Paper>
  );
};

export default PhoneSection;
