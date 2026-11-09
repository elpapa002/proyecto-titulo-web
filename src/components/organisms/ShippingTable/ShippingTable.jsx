import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearPrecio } from "../../../utils/formato";

const textoDias = (dias) => `${dias} ${dias === 1 ? "día hábil" : "días hábiles"}`;

const ShippingTable = ({ costos, cargando, onEditar, onEliminar }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
      <Table sx={{ minWidth: 520 }}>
        <TableHead>
          <TableRow>
            <TableCell>Comuna</TableCell>
            <TableCell>Costo</TableCell>
            <TableCell>Días estimados</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {costos.map((c) => (
            <TableRow key={c.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
              <TableCell sx={{ fontWeight: 600 }}>{c.comuna}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {c.costo === 0 ? <StatusChip texto="Gratis" relleno /> : formatearPrecio(c.costo)}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{textoDias(c.dias)}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEditar(c)} aria-label={`Editar envío a ${c.comuna}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => onEliminar(c)} aria-label={`Eliminar envío a ${c.comuna}`}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {costos.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4, borderBottom: 0 }}>
                {cargando
                  ? "Cargando costos de envío..."
                  : "Todavía no agregas comunas. Mientras no tengas ninguna, nadie podrá comprarte."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShippingTable;
