import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import AddressFormDialog from "../AddressFormDialog/AddressFormDialog";
import DeleteDialog from "../DeleteDialog/DeleteDialog";
import {
  actualizarDireccion,
  crearDireccion,
  eliminarDireccion,
  obtenerDirecciones,
} from "../../../services/direccionService";

const textoDireccion = (d) => `${d.calle} ${d.numero}, ${d.comuna}`;

const AddressSection = ({ usuarioId, onAviso }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerDirecciones(usuarioId);
      if (respuesta.ok) setDirecciones(respuesta.datos);
      else onAviso("No se pudieron cargar tus direcciones.");
      setCargando(false);
    };
    cargar();
  }, [usuarioId, recargas, onAviso]);

  const guardar = async (datos) => {
    const original = formulario.direccion;
    const respuesta = original ? await actualizarDireccion(original.id, datos) : await crearDireccion(datos);
    if (!respuesta.ok) {
      onAviso(respuesta.error);
      return;
    }
    onAviso(original ? "Dirección actualizada" : "Dirección agregada");
    setFormulario(null);
    setRecargas((n) => n + 1);
  };

  const confirmarBorrado = async () => {
    const direccion = aBorrar;
    console.log("Dirección eliminada:", {
      id: direccion.id,
      calle: direccion.calle,
      numero: direccion.numero,
      comuna: direccion.comuna,
    });
    const respuesta = await eliminarDireccion(direccion.id);
    setABorrar(null);
    if (!respuesta.ok) {
      onAviso(respuesta.error);
      return;
    }
    onAviso("Dirección eliminada");
    setRecargas((n) => n + 1);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Typography variant="h3">Direcciones de despacho</Typography>
        <CustomButton tono="contorno" startIcon={<AddIcon />} onClick={() => setFormulario({ direccion: null })}>
          Agregar dirección
        </CustomButton>
      </Box>

      <Stack spacing={1.5}>
        {direcciones.length === 0 && (
          <Typography>{cargando ? "Cargando direcciones..." : "Todavía no tienes direcciones registradas."}</Typography>
        )}
        {direcciones.map((d) => (
          <Box
            key={d.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              border: "1px solid",
              borderColor: "text.primary",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <PlaceOutlinedIcon fontSize="small" />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 600 }}>{textoDireccion(d)}</Typography>
                {d.principal && <StatusChip texto="Principal" />}
              </Box>
              <Typography variant="body2">
                {d.codigoPostal ? `Código postal ${d.codigoPostal}` : "Sin código postal"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexShrink: 0 }}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => setFormulario({ direccion: d })} aria-label={`Editar ${textoDireccion(d)}`}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => setABorrar(d)} aria-label={`Eliminar ${textoDireccion(d)}`}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Stack>

      <Typography variant="body2" sx={{ mt: 1.5 }}>
        Debes tener al menos una dirección de despacho registrada.
      </Typography>

      {formulario && (
        <AddressFormDialog
          direccion={formulario.direccion}
          direcciones={direcciones}
          usuarioId={usuarioId}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar dirección?"
        mensaje={aBorrar ? `Vas a eliminar "${textoDireccion(aBorrar)}". Esta acción no se puede deshacer.` : ""}
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />
    </Paper>
  );
};

export default AddressSection;
