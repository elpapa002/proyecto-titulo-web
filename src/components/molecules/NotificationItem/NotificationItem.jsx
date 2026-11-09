import { Box, ButtonBase, IconButton, Tooltip, Typography } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearFecha } from "../../../utils/formato";

const iconos = [
  { parte: "/compras", icono: <LocalShippingOutlinedIcon fontSize="small" /> },
  { parte: "/ventas", icono: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { parte: "/cotizaciones", icono: <RequestQuoteOutlinedIcon fontSize="small" /> },
  { parte: "/devoluciones", icono: <AssignmentReturnOutlinedIcon fontSize="small" /> },
  { parte: "/preguntas", icono: <HelpOutlineOutlinedIcon fontSize="small" /> },
  { parte: "/mensajes", icono: <ChatBubbleOutlineIcon fontSize="small" /> },
  { parte: "/producto", icono: <PercentOutlinedIcon fontSize="small" /> },
];

const NotificationItem = ({ aviso, onAbrir, onEliminar }) => {
  const icono = iconos.find((i) => aviso.ruta?.includes(i.parte))?.icono ?? <NotificationsNoneOutlinedIcon fontSize="small" />;

  return (
    <Box
      component="li"
      sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1.5, borderBottom: "1px solid", borderColor: "text.primary", "&:last-child": { borderBottom: 0 } }}
    >
      <ButtonBase
        onClick={() => onAbrir(aviso)}
        sx={{ flexGrow: 1, minWidth: 0, justifyContent: "flex-start", textAlign: "left", gap: 1.5, px: 2, py: 1.75 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "text.primary",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icono}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: aviso.leida ? 400 : 600 }}>{aviso.texto}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography variant="body2">{formatearFecha(aviso.fecha)}</Typography>
            {!aviso.leida && <StatusChip texto="Nuevo" relleno />}
          </Box>
        </Box>
      </ButtonBase>
      <Tooltip title="Eliminar aviso">
        <IconButton size="small" onClick={() => onEliminar(aviso)} aria-label={`Eliminar aviso: ${aviso.texto}`}>
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default NotificationItem;
