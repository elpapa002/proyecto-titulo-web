import { useState } from "react";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import FormField from "../../molecules/FormField/FormField";
import { formatearFecha } from "../../../utils/formato";

const MIN_RESPUESTA = 5;
const MAX_RESPUESTA = 500;

const QuestionCard = ({ pregunta, onResponder, onEliminar }) => {
  const [respuesta, setRespuesta] = useState("");
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const respondida = Boolean(pregunta.respuesta);

  const cambiar = (e) => {
    setRespuesta(e.target.value);
    setErrores({ ...errores, respuesta: undefined });
  };

  const validar = () => {
    const e = {};
    const texto = respuesta.trim();
    if (!texto) e.respuesta = "Escribe tu respuesta.";
    else if (texto.length < MIN_RESPUESTA) e.respuesta = `La respuesta debe tener al menos ${MIN_RESPUESTA} caracteres.`;
    else if (texto.length > MAX_RESPUESTA) e.respuesta = `La respuesta puede tener hasta ${MAX_RESPUESTA} caracteres.`;
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const texto = respuesta.trim();
    console.log("Respuesta a pregunta:", { id: pregunta.id, productoId: pregunta.productoId, respuesta: texto });
    setGuardando(true);
    await onResponder(pregunta, texto);
    setGuardando(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              border: "1px solid",
              borderColor: "text.primary",
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
            }}
          >
            <ImageOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>{pregunta.nombreProducto}</Typography>
            <Typography variant="body2">
              {pregunta.cliente} · {formatearFecha(pregunta.fecha)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          <StatusChip texto={respondida ? "Respondida" : "Sin responder"} relleno={!respondida} />
          <Tooltip title="Eliminar pregunta">
            <IconButton size="small" onClick={() => onEliminar(pregunta)} aria-label={`Eliminar pregunta de ${pregunta.cliente}`}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          border: "1px solid",
          borderColor: "text.primary",
          borderRadius: 1,
          p: 1.25,
          mt: 2,
        }}
      >
        <HelpOutlineOutlinedIcon fontSize="small" sx={{ mt: 0.25 }} />
        <Typography sx={{ fontWeight: 600 }}>{pregunta.texto}</Typography>
      </Box>

      {respondida ? (
        <Typography sx={{ mt: 2 }}>
          Respuesta publicada el {formatearFecha(pregunta.fechaRespuesta)}: "{pregunta.respuesta}"
        </Typography>
      ) : (
        <Box component="form" noValidate onSubmit={enviar} sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
            <FormField
              label="Tu respuesta pública"
              required
              multiline
              minRows={1}
              placeholder="Escribe tu respuesta..."
              value={respuesta}
              onChange={cambiar}
              slotProps={{ htmlInput: { maxLength: MAX_RESPUESTA } }}
              error={Boolean(errores.respuesta)}
              helperText={errores.respuesta ?? `${respuesta.length}/${MAX_RESPUESTA} caracteres`}
            />
            <CustomButton
              type="submit"
              startIcon={<SendOutlinedIcon />}
              disabled={guardando}
              sx={{ mt: { xs: 0, sm: 3.25 }, flexShrink: 0 }}
            >
              {guardando ? "Enviando..." : "Responder"}
            </CustomButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default QuestionCard;
