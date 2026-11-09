import { useEffect, useState } from "react";
import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import OrderStatusForm from "../../components/organisms/OrderStatusForm/OrderStatusForm";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { actualizarPedido, obtenerVenta } from "../../services/ventaService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const Fila = ({ etiqueta, valor, destacado = false }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75 }}>
    <Typography sx={{ fontWeight: destacado ? 700 : 400 }}>{etiqueta}</Typography>
    <Typography sx={{ fontWeight: destacado ? 700 : 400, textAlign: "right", fontSize: destacado ? 18 : 14 }}>
      {valor}
    </Typography>
  </Box>
);

const SaleDetailScreen = () => {
  const { id } = useParams();
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerVenta(Number(id));
      if (!respuesta.ok) setError("No encontramos esta venta. Revisa el número del pedido.");
      else if (respuesta.datos.vendedorId !== usuario.id) setError("Esta venta no es de tu tienda, por eso no puedes verla.");
      else {
        setVenta(respuesta.datos);
        setError("");
      }
      setCargando(false);
    };
    cargar();
  }, [id, usuario.id, recargas]);

  const guardarPedido = async (datos) => {
    const respuesta = await actualizarPedido(venta.id, datos);
    if (!respuesta.ok) {
      setAviso("No se pudo actualizar el pedido. Intenta de nuevo.");
      return;
    }
    setAviso("Pedido actualizado");
    setRecargas((n) => n + 1);
  };

  const volver = (
    <CustomButton tono="contorno" startIcon={<ArrowBackIcon />} onClick={() => navigate("/mi-tienda/ventas")}>
      Volver a ventas
    </CustomButton>
  );

  if (cargando || error) {
    return (
      <>
        <PageHeader titulo="Detalle de venta" acciones={volver} />
        <Paper variant="outlined" sx={tarjeta}>
          <Typography>{cargando ? "Cargando venta..." : error}</Typography>
        </Paper>
      </>
    );
  }

  const neto = Math.round(venta.total / 1.19);
  const iva = venta.total - neto;
  const { medioPago } = venta;

  return (
    <>
      <PageHeader
        titulo={`Pedido N° ${venta.id}`}
        subtitulo={`Venta del ${formatearFecha(venta.fecha)} a ${venta.cliente}.`}
        acciones={volver}
      />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: -1.5, mb: 3 }}>
        <Typography variant="body2">Transacción</Typography>
        <StatusChip texto={venta.estadoTransaccion} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Pedido
        </Typography>
        <StatusChip texto={venta.estadoPedido} relleno />
      </Box>

      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <OrderStatusForm
            key={`${venta.id}-${venta.estadoPedido}-${venta.seguimiento}`}
            venta={venta}
            onGuardar={guardarPedido}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Datos de la venta
            </Typography>
            <Fila etiqueta="Cliente" valor={venta.cliente} />
            <Fila etiqueta="Fecha" valor={formatearFecha(venta.fecha)} />
            <Fila etiqueta="Dirección de despacho" valor={venta.direccion} />
            {venta.empresaTransporte && (
              <Fila etiqueta="Despacho" valor={`${venta.empresaTransporte} · ${venta.seguimiento}`} />
            )}
            <Divider sx={{ my: 1 }} />
            {venta.items.map((item) => (
              <Fila
                key={item.productoId}
                etiqueta={`${item.nombre} × ${item.cantidad}`}
                valor={formatearPrecio(item.precio * item.cantidad)}
              />
            ))}
            <Fila etiqueta="Envío" valor={formatearPrecio(venta.envio)} />
            <Fila etiqueta="Valor neto" valor={formatearPrecio(neto)} />
            <Fila etiqueta="IVA (19%)" valor={formatearPrecio(iva)} />
            <Divider sx={{ my: 1 }} />
            <Fila etiqueta="Total" valor={formatearPrecio(venta.total)} destacado />
            <Fila
              etiqueta="Medio de pago"
              valor={`${medioPago.tipo} ${medioPago.marca} •••• ${medioPago.ultimos4}`}
            />

            <Stack spacing={1} sx={{ mt: 2 }}>
              <CustomButton
                tono="contorno"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={() => navigate("/mi-tienda/mensajes", { state: { clienteId: venta.clienteId } })}
              >
                Escribir al cliente
              </CustomButton>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default SaleDetailScreen;
