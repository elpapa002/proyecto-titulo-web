import { Box, Divider, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearFecha, formatearPrecio } from "../../../utils/formato";

const Fila = ({ texto, valor, destacada = false }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
    <Typography sx={{ fontWeight: destacada ? 600 : 400 }}>{texto}</Typography>
    <Typography sx={{ textAlign: "right", fontWeight: destacada ? 700 : 400, fontSize: destacada ? 16 : 14 }}>
      {valor}
    </Typography>
  </Box>
);

const PurchaseReceipt = ({ venta, cliente }) => {
  const neto = Math.round(venta.total / 1.19);
  const iva = venta.total - neto;
  const { tipo, marca, ultimos4 } = venta.medioPago;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box>
          <Typography variant="h3">Boleta electrónica</Typography>
          <Typography variant="body2">N° de venta {venta.id}</Typography>
        </Box>
        <StatusChip texto={`Transacción ${venta.estadoTransaccion.toLowerCase()}`} />
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Fila texto="Fecha" valor={formatearFecha(venta.fecha)} />
      <Fila texto="Vendedor" valor={venta.tienda} />
      <Fila texto="Cliente" valor={`${cliente.nombres} ${cliente.apellidos}`} />
      {cliente.run && <Fila texto="RUN cliente" valor={cliente.run} />}
      <Fila texto="Despacho a" valor={venta.direccion} />
      <Divider sx={{ my: 1.5 }} />
      {venta.items.map((item) => (
        <Box key={item.productoId} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography>
            <Link
              component={RouterLink}
              to={`/tienda/producto/${item.productoId}`}
              underline="hover"
              sx={{ color: "text.primary" }}
            >
              {item.nombre}
            </Link>{" "}
            {item.cantidad} × {formatearPrecio(item.precio)}
          </Typography>
          <Typography sx={{ textAlign: "right" }}>{formatearPrecio(item.cantidad * item.precio)}</Typography>
        </Box>
      ))}
      <Fila texto="Despacho" valor={formatearPrecio(venta.envio)} />
      <Divider sx={{ my: 1.5 }} />
      <Fila texto="Valor neto" valor={formatearPrecio(neto)} />
      <Fila texto="IVA (19%)" valor={formatearPrecio(iva)} />
      <Fila texto="Total" valor={formatearPrecio(venta.total)} destacada />
      <Fila texto="Medio de pago" valor={`${tipo} · ${marca} •••• ${ultimos4}`} />
    </Paper>
  );
};

export default PurchaseReceipt;
