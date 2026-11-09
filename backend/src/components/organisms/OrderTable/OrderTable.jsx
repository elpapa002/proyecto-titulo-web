import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearPrecio } from "../../../utils/formato";

const OrderTable = ({ pedidos, cargando }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
      <Table sx={{ minWidth: 480 }}>
        <TableHead>
          <TableRow>
            <TableCell>N.º</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pedidos.map((pedido) => (
            <TableRow key={pedido.id} sx={{ "&:last-child td": { borderBottom: 0 } }}>
              <TableCell sx={{ fontWeight: 600 }}>{pedido.id}</TableCell>
              <TableCell>{pedido.cliente}</TableCell>
              <TableCell>{formatearPrecio(pedido.total)}</TableCell>
              <TableCell>
                <StatusChip texto={pedido.estado} relleno={pedido.estado === "En preparación"} />
              </TableCell>
            </TableRow>
          ))}
          {pedidos.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4, borderBottom: 0 }}>
                {cargando ? "Cargando pedidos..." : "Todavía no tienes pedidos."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderTable;
