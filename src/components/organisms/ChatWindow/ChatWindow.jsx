import { useEffect, useId, useRef, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ChatAvatar from "../../atoms/ChatAvatar/ChatAvatar";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import { formatearFecha } from "../../../utils/formato";

const fechaMensaje = (fecha) => `${formatearFecha(fecha.slice(0, 10))} ${fecha.slice(11)}`;

const ChatWindow = ({ conversacion, mensajes, usuarioId, comoVendedor, esMovil, onVolver, onEnviar }) => {
  const campoId = useId();
  const zonaMensajes = useRef(null);
  const [texto, setTexto] = useState("");
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (zonaMensajes.current) zonaMensajes.current.scrollTop = zonaMensajes.current.scrollHeight;
  }, [mensajes]);

  const cambiar = (e) => {
    setTexto(e.target.value);
    setErrores({ ...errores, texto: undefined });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const limpio = texto.trim();
    const e = {};
    if (!limpio) e.texto = "Escribe un mensaje antes de enviar.";
    else if (limpio.length > 500) e.texto = "El mensaje puede tener hasta 500 caracteres.";
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    const enviado = await onEnviar(limpio);
    setEnviando(false);
    if (enviado) setTexto("");
  };

  if (!conversacion) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", height: "100%", minHeight: 300, p: 3 }}>
        <Typography>Elige una conversación para ver los mensajes.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "text.primary" }}>
        {esMovil && (
          <IconButton onClick={onVolver} aria-label="Volver a la lista de conversaciones" sx={{ ml: -1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <ChatAvatar nombre={conversacion.nombre} />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 600 }}>
            {conversacion.nombre}
          </Typography>
          <Typography variant="body2">{comoVendedor ? "Cliente" : "Emprendedor"}</Typography>
        </Box>
      </Box>

      <Box ref={zonaMensajes} sx={{ flexGrow: 1, overflowY: "auto", p: 2, minHeight: { xs: 320, md: 0 } }}>
        {mensajes === null && <Typography>Cargando mensajes...</Typography>}
        {mensajes?.length === 0 && <Typography>Todavía no hay mensajes. Escribe el primero.</Typography>}
        <Stack spacing={1.5}>
          {mensajes?.map((m) => {
            const propio = m.autorId === usuarioId;
            return (
              <Box
                key={m.id}
                sx={{
                  alignSelf: propio ? "flex-end" : "flex-start",
                  maxWidth: { xs: "85%", md: "70%" },
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: propio ? "primary.main" : "text.primary",
                  bgcolor: propio ? "primary.main" : "secondary.main",
                  color: propio ? "secondary.main" : "text.primary",
                }}
              >
                <Typography sx={{ color: "inherit", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.texto}</Typography>
                <Typography variant="body2" sx={{ color: "inherit", mt: 0.5, opacity: 0.85 }}>
                  {fechaMensaje(m.fecha)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box component="form" onSubmit={enviar} noValidate sx={{ p: 2, borderTop: "1px solid", borderColor: "text.primary" }}>
        <Typography component="label" htmlFor={campoId} sx={{ display: "block", fontSize: 13, fontWeight: 500, mb: 0.75 }}>
          Mensaje
          <Box component="span" aria-hidden="true"> *</Box>
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <FormField
            id={campoId}
            name="texto"
            required
            placeholder="Escribe un mensaje..."
            value={texto}
            onChange={cambiar}
            autoComplete="off"
            slotProps={{ htmlInput: { maxLength: 500 } }}
            error={Boolean(errores.texto)}
            helperText={errores.texto ?? `${texto.trim().length}/500 caracteres`}
          />
          <CustomButton type="submit" startIcon={<SendOutlinedIcon />} disabled={enviando} sx={{ flexShrink: 0, minHeight: 44 }}>
            Enviar
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;
