import { useEffect, useState } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import QuoteReplyDialog from "../../components/organisms/QuoteReplyDialog/QuoteReplyDialog";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { DIAS_VIGENCIA, obtenerCotizacionesRecibidas, responderCotizacion } from "../../services/cotizacionService";
import { obtenerMisProductos } from "../../services/productService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";

const ESTADOS = ["Pendiente", "Respondida", "Aceptada", "Rechazada", "Vencida"];
const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };
const recuadro = { border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.25 };

const textoVigencia = (cotizacion) => {
  const { respuesta, estado } = cotizacion;
  if (estado === "Vencida") return `Venció el ${formatearFecha(respuesta.vigencia)}`;
  if (estado === "Respondida") return `Vigente hasta el ${formatearFecha(respuesta.vigencia)}`;
  return `Tenía vigencia hasta el ${formatearFecha(respuesta.vigencia)}`;
};

const ReceivedQuotesScreen = () => {
  const { usuario } = useUser();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [filtro, setFiltro] = useState("Todas");
  const [aResponder, setAResponder] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaCotizaciones, respuestaProductos] = await Promise.all([
        obtenerCotizacionesRecibidas(usuario.id),
        obtenerMisProductos(usuario.id),
      ]);
      if (respuestaCotizaciones.ok)
        setCotizaciones([...respuestaCotizaciones.datos].sort((a, b) => b.fecha.localeCompare(a.fecha)));
      else setAviso("No se pudieron cargar las cotizaciones.");
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const guardarRespuesta = async (datos) => {
    const respuesta = await responderCotizacion(aResponder.id, datos);
    if (!respuesta.ok) {
      setAviso("No se pudo enviar la respuesta. Intenta de nuevo.");
      return;
    }
    setAviso("Cotización respondida");
    setAResponder(null);
    setRecargas((n) => n + 1);
  };

  const chips = ["Todas", ...ESTADOS].map((estado) => ({
    valor: estado,
    cantidad: estado === "Todas" ? cotizaciones.length : cotizaciones.filter((c) => c.estado === estado).length,
  }));
  const visibles = cotizaciones.filter((c) => filtro === "Todas" || c.estado === filtro);

  return (
    <>
      <PageHeader
        titulo="Cotizaciones recibidas"
        subtitulo={`Responde con tus precios. La cotización queda vigente por ${DIAS_VIGENCIA} días desde que la envías.`}
      />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
        {chips.map((chip) => (
          <Chip
            key={chip.valor}
            label={`${chip.valor} (${chip.cantidad})`}
            color="primary"
            variant={filtro === chip.valor ? "filled" : "outlined"}
            onClick={() => setFiltro(chip.valor)}
            sx={{ ...(filtro !== chip.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <Stack spacing={2}>
        {visibles.length === 0 && (
          <Paper variant="outlined" sx={tarjeta}>
            <Typography>{cargando ? "Cargando cotizaciones..." : "No hay cotizaciones con este estado."}</Typography>
          </Paper>
        )}

        {visibles.map((cotizacion) => (
          <Paper key={cotizacion.id} variant="outlined" sx={tarjeta}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h3">
                  Cotización N° {cotizacion.id} · {cotizacion.cliente}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>
                  Pedida el {formatearFecha(cotizacion.fecha)}
                  {cotizacion.fechaRequerida && ` · La necesita para el ${formatearFecha(cotizacion.fechaRequerida)}`}
                </Typography>
              </Box>
              <StatusChip texto={cotizacion.estado} relleno={cotizacion.estado === "Pendiente"} />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>Productos</Typography>
              {cotizacion.items.map((item) => (
                <Typography key={item.productoId}>
                  {item.nombre} × {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
                </Typography>
              ))}
            </Box>

            <Box sx={{ ...recuadro, display: "flex", gap: 1, alignItems: "flex-start", mt: 2 }}>
              <ChatBubbleOutlineIcon fontSize="small" sx={{ mt: 0.25 }} />
              <Typography>"{cotizacion.mensaje}"</Typography>
            </Box>

            {cotizacion.estado === "Pendiente" && (
              <CustomButton startIcon={<ReplyOutlinedIcon />} onClick={() => setAResponder(cotizacion)} sx={{ mt: 2 }}>
                Responder
              </CustomButton>
            )}

            {cotizacion.estado !== "Pendiente" && cotizacion.respuesta && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>
                  Tu respuesta del {formatearFecha(cotizacion.respuesta.fecha)}
                </Typography>
                {cotizacion.respuesta.precios.map((precio) => {
                  const item = cotizacion.items.find((i) => i.productoId === precio.productoId);
                  return (
                    <Typography key={precio.productoId}>
                      {item?.nombre ?? "Producto"}: {formatearPrecio(precio.precio)} c/u
                      {item && ` · ${formatearPrecio(precio.precio * item.cantidad)}`}
                    </Typography>
                  );
                })}
                <Typography sx={{ fontWeight: 700, mt: 0.5 }}>Total: {formatearPrecio(cotizacion.respuesta.total)}</Typography>
                {cotizacion.respuesta.comentario && (
                  <Typography sx={{ mt: 0.5 }}>Comentario: "{cotizacion.respuesta.comentario}"</Typography>
                )}
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {textoVigencia(cotizacion)}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>

      {aResponder && (
        <QuoteReplyDialog
          cotizacion={aResponder}
          productos={productos}
          onCerrar={() => setAResponder(null)}
          onGuardar={guardarRespuesta}
        />
      )}

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default ReceivedQuotesScreen;
