import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Divider, Grid, Link, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutlineOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import OrderTracking from "../../components/organisms/OrderTracking/OrderTracking";
import RatingDialog from "../../components/organisms/RatingDialog/RatingDialog";
import ReturnRequestDialog from "../../components/organisms/ReturnRequestDialog/ReturnRequestDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import InfoHint from "../../components/molecules/InfoHint/InfoHint";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerVenta } from "../../services/ventaService";
import { crearCalificacion } from "../../services/calificacionService";
import { crearDevolucion, obtenerMisDevoluciones } from "../../services/devolucionService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const Fila = ({ etiqueta, valor, destacado = false }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75 }}>
    <Typography sx={{ fontWeight: destacado ? 600 : 400 }}>{etiqueta}</Typography>
    <Typography sx={{ fontWeight: destacado ? 600 : 400, textAlign: "right" }}>{valor}</Typography>
  </Box>
);

const PurchaseDetailScreen = () => {
  const { id } = useParams();
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [devoluciones, setDevoluciones] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [dialogo, setDialogo] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaVenta, respuestaDevoluciones] = await Promise.all([
        obtenerVenta(Number(id)),
        obtenerMisDevoluciones(usuario.id),
      ]);
      if (!respuestaVenta.ok) {
        setVenta(null);
        setError("No encontramos esta compra. Revisa el número del pedido.");
      } else if (respuestaVenta.datos.clienteId !== usuario.id) {
        setVenta(null);
        setError("Esta compra no pertenece a tu cuenta, por eso no puedes ver su detalle.");
      } else {
        setVenta(respuestaVenta.datos);
        setError("");
      }
      if (respuestaDevoluciones.ok) setDevoluciones(respuestaDevoluciones.datos.filter((d) => d.ventaId === Number(id)));
      setCargando(false);
    };
    cargar();
  }, [id, usuario.id, recargas]);

  const guardarCalificacion = async (datos) => {
    const respuesta = await crearCalificacion(datos);
    if (!respuesta.ok) {
      setAviso(respuesta.error);
      return;
    }
    setDialogo("");
    setAviso("Calificación publicada. Gracias por tu opinión");
    setRecargas((n) => n + 1);
  };

  const guardarDevolucion = async (datos) => {
    const respuesta = await crearDevolucion(datos);
    if (!respuesta.ok) return respuesta.error;
    setDialogo("");
    setAviso("Solicitud de devolución enviada");
    setRecargas((n) => n + 1);
    return "";
  };

  const migas = (
    <Breadcrumbs separator="›" sx={{ mb: 1.5, "& .MuiBreadcrumbs-li, & .MuiBreadcrumbs-separator": { fontSize: 12 } }}>
      <Link component={RouterLink} to="/tienda/compras" sx={{ color: "text.primary", fontSize: 12 }}>
        Mis compras
      </Link>
      <Typography variant="body2">Pedido N° {id}</Typography>
    </Breadcrumbs>
  );

  if (cargando || !venta) {
    return (
      <>
        {migas}
        <PageHeader titulo={`Pedido N° ${id}`} subtitulo={cargando ? "Cargando compra..." : undefined} />
        {!cargando && (
          <Paper variant="outlined" sx={tarjeta}>
            <Typography sx={{ mb: 2 }}>{error}</Typography>
            <CustomButton tono="contorno" onClick={() => navigate("/tienda/compras")}>
              Volver a mis compras
            </CustomButton>
          </Paper>
        )}
      </>
    );
  }

  const entregado = venta.estadoPedido === "Entregado";
  const subtotal = venta.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const neto = Math.round(venta.total / 1.19);
  const iva = venta.total - neto;
  const medioPago = `${venta.medioPago.tipo} ${venta.medioPago.marca} •••• ${venta.medioPago.ultimos4}`;

  let nota = "";
  if (venta.estadoPedido === "Cancelado") nota = "Esta compra fue cancelada, no se puede calificar ni devolver.";
  else if (!entregado) nota = "Podrás calificar la compra y pedir una devolución cuando el pedido esté entregado.";
  else if (venta.calificada) nota = "Ya calificaste esta compra. Gracias por tu opinión.";

  return (
    <>
      {migas}
      <PageHeader titulo={`Pedido N° ${venta.id}`} subtitulo={`Compra del ${formatearFecha(venta.fecha)} en ${venta.tienda}`} />

      <Paper variant="outlined" sx={{ ...tarjeta, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Typography variant="h3">Estado del pedido</Typography>
          <StatusChip texto={`Transacción: ${venta.estadoTransaccion}`} relleno={venta.estadoTransaccion === "Pendiente"} />
        </Box>
        <OrderTracking estado={venta.estadoPedido} />
      </Paper>

      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={tarjeta}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <LocalShippingOutlinedIcon fontSize="small" />
                <Typography variant="h3">Seguimiento del envío</Typography>
              </Box>
              <Fila etiqueta="Empresa de transporte" valor={venta.empresaTransporte || "Por asignar"} />
              <Fila etiqueta="N° de seguimiento" valor={venta.seguimiento || "Se informa cuando se envíe"} />
              <Fila etiqueta="Estado del pedido" valor={venta.estadoPedido} />
              <Fila etiqueta="Dirección de entrega" valor={venta.direccion} />
            </Paper>

            {(entregado || devoluciones.length > 0) && (
              <Paper variant="outlined" sx={tarjeta}>
                <Typography variant="h3" sx={{ mb: 1.5 }}>
                  Devoluciones de esta compra
                </Typography>
                {devoluciones.length === 0 && <Typography>No has pedido devoluciones de esta compra.</Typography>}
                <Stack spacing={1.5}>
                  {devoluciones.map((d) => (
                    <Box key={d.id} sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 600 }}>{d.nombreProducto}</Typography>
                        <StatusChip texto={d.estado} relleno={d.estado === "Pendiente"} />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Pedida el {formatearFecha(d.fecha)} · {d.cantidad} {d.cantidad === 1 ? "unidad" : "unidades"} ·{" "}
                        {formatearPrecio(d.monto)}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          Motivo:
                        </Box>{" "}
                        {d.motivo}. {d.detalle}
                      </Typography>
                      <Typography sx={{ mt: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          Respuesta del vendedor:
                        </Box>{" "}
                        {d.respuesta || "Todavía no responde."}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Productos
            </Typography>
            <Stack spacing={1.5}>
              {venta.items.map((item) => (
                <Box key={item.productoId} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Link
                      component={RouterLink}
                      to={`/tienda/producto/${item.productoId}`}
                      sx={{ color: "text.primary", fontWeight: 600, textDecorationColor: "inherit" }}
                    >
                      {item.nombre}
                    </Link>
                    <Typography variant="body2">
                      {item.cantidad} × {formatearPrecio(item.precio)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>{formatearPrecio(item.precio * item.cantidad)}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Fila etiqueta="Subtotal productos" valor={formatearPrecio(subtotal)} />
            <Fila etiqueta="Envío" valor={formatearPrecio(venta.envio)} />
            <Fila etiqueta="Total pagado" valor={formatearPrecio(venta.total)} destacado />
            <Box sx={{ border: "1px dashed", borderColor: "text.primary", borderRadius: 1, px: 1.5, py: 0.5, mt: 1 }}>
              <Fila etiqueta="Monto neto" valor={formatearPrecio(neto)} />
              <Fila etiqueta="IVA (19%)" valor={formatearPrecio(iva)} />
              <Typography variant="body2" sx={{ pb: 0.75 }}>
                El total pagado ya incluye IVA y envío.
              </Typography>
            </Box>
            <Fila etiqueta="Medio de pago" valor={medioPago} />

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {entregado && !venta.calificada && (
                <CustomButton fullWidth startIcon={<StarOutlineIcon />} onClick={() => setDialogo("calificar")}>
                  Calificar compra
                </CustomButton>
              )}
              {entregado && (
                <CustomButton tono="contorno" fullWidth startIcon={<UndoIcon />} onClick={() => setDialogo("devolver")}>
                  Solicitar devolución
                </CustomButton>
              )}
              <CustomButton
                tono="contorno"
                fullWidth
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={() => navigate("/tienda/mensajes", { state: { vendedorId: venta.vendedorId } })}
              >
                Contactar al vendedor
              </CustomButton>
              {nota && <InfoHint texto={nota} />}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {dialogo === "calificar" && (
        <RatingDialog venta={venta} onCerrar={() => setDialogo("")} onGuardar={guardarCalificacion} />
      )}
      {dialogo === "devolver" && (
        <ReturnRequestDialog venta={venta} onCerrar={() => setDialogo("")} onGuardar={guardarDevolucion} />
      )}

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default PurchaseDetailScreen;
