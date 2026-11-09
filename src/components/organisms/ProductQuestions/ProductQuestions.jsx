import { useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import { formatearFecha } from "../../../utils/formato";

const ProductQuestions = ({ preguntas, tienda, mostrarFormulario, onPreguntar }) => {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    const largo = texto.trim().length;
    if (largo < 5) {
      setError("Escribe tu pregunta, mínimo 5 caracteres.");
      return;
    }
    if (largo > 300) {
      setError("La pregunta puede tener como máximo 300 caracteres.");
      return;
    }
    setEnviando(true);
    const guardada = await onPreguntar(texto.trim());
    setEnviando(false);
    if (guardada) setTexto("");
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary", height: "100%" }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Preguntas al vendedor
      </Typography>

      {mostrarFormulario && (
        <Box component="form" noValidate onSubmit={enviar} sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Los campos marcados con * son obligatorios.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <FormField
              label="Tu pregunta"
              name="pregunta"
              required
              placeholder="Escribe tu pregunta para el vendedor"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                setError("");
              }}
              error={Boolean(error)}
              helperText={error || `Entre 5 y 300 caracteres (${texto.trim().length}/300)`}
              slotProps={{ htmlInput: { maxLength: 300 } }}
            />
            <CustomButton type="submit" disabled={enviando} sx={{ mt: { xs: 0, sm: "26px" }, flexShrink: 0 }}>
              {enviando ? "Enviando..." : "Preguntar"}
            </CustomButton>
          </Box>
        </Box>
      )}

      {preguntas.length === 0 ? (
        <Typography>Todavía nadie ha preguntado por esta publicación.</Typography>
      ) : (
        <Stack spacing={2}>
          {preguntas.map((pregunta) => (
            <Box key={pregunta.id}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <HelpOutlineIcon fontSize="small" sx={{ mt: "1px" }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{pregunta.texto}</Typography>
                  <Typography variant="body2">
                    {pregunta.cliente} · {formatearFecha(pregunta.fecha)}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  border: "1px solid",
                  borderColor: "text.primary",
                  borderRadius: 1,
                  p: 1.25,
                  mt: 1,
                  ml: 3.5,
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" sx={{ mt: "1px" }} />
                {pregunta.respuesta ? (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Respuesta de {tienda} · {formatearFecha(pregunta.fechaRespuesta)}
                    </Typography>
                    <Typography>{pregunta.respuesta}</Typography>
                  </Box>
                ) : (
                  <Typography>Sin responder todavía</Typography>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default ProductQuestions;
