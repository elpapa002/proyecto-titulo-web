import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearFecha, formatearPrecio } from "../../../utils/formato";

const textosEstado = {
  Pendiente: "Esperando la respuesta del emprendedor.",
  Respondida: "El emprendedor respondió. Revisa los valores y decide si aceptas o rechazas.",
  Aceptada: "Aceptaste esta cotización. Coordina la compra con el emprendedor por mensajes.",
  Rechazada: "Rechazaste esta cotización.",
  Vencida: "Esta cotización venció. Si todavía te interesa, pide una nueva desde el producto.",
};

const negrita = { fontWeight: 600 };

const QuoteCard = ({ cotizacion, diasVigencia, onAceptar, onRechazar, onCancelar, onMensaje }) => {
  const respuesta = cotizacion.respuesta;
  const productos = cotizacion.items.length;
  const unidades = cotizacion.items.reduce((suma, item) => suma + item.cantidad, 0);
  const precioDe = (productoId) => respuesta?.precios.find((p) => p.productoId === productoId)?.precio ?? 0;

  return (
    <Paper variant="outlined" component="article" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3">{cotizacion.tienda}</Typography>
          <Typography variant="body2">
            Cotización N° {cotizacion.id} · Pedida el {formatearFecha(cotizacion.fecha)}
          </Typography>
        </Box>
        <StatusChip texto={cotizacion.estado} relleno={cotizacion.estado === "Respondida"} />
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: respuesta ? 6 : 12 }}>
          <Typography sx={negrita}>Lo que pediste</Typography>
          <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
            {cotizacion.items.map((item) => (
              <Typography component="li" key={item.productoId}>
                {item.nombre} × {item.cantidad}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {productos} {productos === 1 ? "producto" : "productos"} · {unidades} {unidades === 1 ? "unidad" : "unidades"}
          </Typography>
          {cotizacion.fechaRequerida && (
            <Typography sx={{ mt: 1 }}>
              <Box component="span" sx={negrita}>
                Fecha requerida:
              </Box>{" "}
              {formatearFecha(cotizacion.fechaRequerida)}
            </Typography>
          )}
          <Typography sx={{ mt: 1 }}>
            <Box component="span" sx={negrita}>
              Tu mensaje:
            </Box>{" "}
            {cotizacion.mensaje}
          </Typography>
        </Grid>

        {respuesta && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.5 }}>
              <Typography sx={{ ...negrita, mb: 0.5 }}>Respuesta del emprendedor</Typography>
              {cotizacion.items.map((item) => (
                <Box key={item.productoId} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.25 }}>
                  <Typography>
                    {item.nombre} × {item.cantidad}
                    <Typography component="span" variant="body2" sx={{ display: "block" }}>
                      {formatearPrecio(precioDe(item.productoId))} c/u
                    </Typography>
                  </Typography>
                  <Typography sx={{ whiteSpace: "nowrap" }}>{formatearPrecio(precioDe(item.productoId) * item.cantidad)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography sx={negrita}>Total</Typography>
                <Typography sx={negrita}>{formatearPrecio(respuesta.total)}</Typography>
              </Box>
              {respuesta.comentario && (
                <Typography sx={{ mt: 1 }}>
                  <Box component="span" sx={negrita}>
                    Comentario:
                  </Box>{" "}
                  {respuesta.comentario}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Respondida el {formatearFecha(respuesta.fecha)}
              </Typography>
              <Typography sx={{ ...negrita, mt: 0.5 }}>
                {cotizacion.estado === "Vencida"
                  ? `Venció el ${formatearFecha(respuesta.vigencia)}`
                  : `Vigente hasta ${formatearFecha(respuesta.vigencia)} (${diasVigencia} días)`}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Typography>{textosEstado[cotizacion.estado]}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <CustomButton tono="contorno" startIcon={<ChatBubbleOutlineIcon />} onClick={() => onMensaje(cotizacion)}>
            Enviar mensaje
          </CustomButton>
          {cotizacion.estado === "Pendiente" && (
            <CustomButton tono="contorno" startIcon={<DeleteOutlinedIcon />} onClick={() => onCancelar(cotizacion)}>
              Cancelar cotización
            </CustomButton>
          )}
          {cotizacion.estado === "Respondida" && (
            <>
              <CustomButton tono="contorno" startIcon={<CloseIcon />} onClick={() => onRechazar(cotizacion)}>
                Rechazar
              </CustomButton>
              <CustomButton startIcon={<CheckIcon />} onClick={() => onAceptar(cotizacion)}>
                Aceptar cotización
              </CustomButton>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default QuoteCard;
