import { useState } from "react";
import {
  Box,
  Chip,
  Grid,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import CustomButton from "../../atoms/Button/CustomButton";
import { formatearFecha, formatearPrecio, normalizar } from "../../../utils/formato";

const filtros = [
  { valor: "todas", texto: "Todas" },
  { valor: "Pendiente", texto: "Pendientes" },
  { valor: "Completada", texto: "Completadas" },
  { valor: "Cancelada", texto: "Canceladas" },
];

const textoProductos = (compra) => {
  const unidades = compra.items.reduce((suma, item) => suma + item.cantidad, 0);
  const productos = compra.items.length;
  return `${productos} ${productos === 1 ? "producto" : "productos"} · ${unidades} ${unidades === 1 ? "unidad" : "unidades"}`;
};

const PurchaseTable = ({ compras, cargando, esMovil }) => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const cumpleFiltro = (valor) => (c) => valor === "todas" || c.estadoTransaccion === valor;

  const filtradas = compras.filter((c) => {
    const texto = normalizar(`${c.id} ${c.tienda}`);
    return texto.includes(normalizar(busqueda.trim())) && cumpleFiltro(filtro)(c);
  });

  const vacio = cargando
    ? "Cargando compras..."
    : compras.length === 0
      ? "Todavía no has hecho compras."
      : "No hay compras que coincidan con la búsqueda.";

  return (
    <Box>
      <Grid container spacing={2} sx={{ alignItems: "flex-end", mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SearchBar label="Buscar compra" placeholder="Número o tienda" value={busqueda} onChange={setBusqueda} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pb: 0.5 }}>
            {filtros.map((f) => (
              <Chip
                key={f.valor}
                label={`${f.texto} (${compras.filter(cumpleFiltro(f.valor)).length})`}
                color="primary"
                variant={filtro === f.valor ? "filled" : "outlined"}
                onClick={() => setFiltro(f.valor)}
                sx={{ ...(filtro !== f.valor && { color: "text.primary", borderColor: "text.primary" }) }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {esMovil ? (
        <Stack spacing={1.5}>
          {filtradas.length === 0 && <Typography sx={{ py: 2, textAlign: "center" }}>{vacio}</Typography>}
          {filtradas.map((c) => (
            <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: "text.primary" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>Pedido N° {c.id}</Typography>
                  <Typography variant="body2">
                    {formatearFecha(c.fecha)} · {c.tienda}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatearPrecio(c.total)}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {textoProductos(c)}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
                <StatusChip texto={`Transacción: ${c.estadoTransaccion}`} relleno={c.estadoTransaccion === "Pendiente"} />
                <StatusChip texto={`Pedido: ${c.estadoPedido}`} relleno={c.estadoPedido === "Enviado"} />
              </Box>
              <CustomButton tono="contorno" fullWidth sx={{ mt: 1.5 }} onClick={() => navigate(`/tienda/compras/${c.id}`)}>
                Ver detalle
              </CustomButton>
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
          <Table sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell>N° pedido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tienda</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Transacción</TableCell>
                <TableCell>Pedido</TableCell>
                <TableCell align="center">Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map((c) => (
                <TableRow key={c.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{c.id}</TableCell>
                  <TableCell>{formatearFecha(c.fecha)}</TableCell>
                  <TableCell>{c.tienda}</TableCell>
                  <TableCell>{textoProductos(c)}</TableCell>
                  <TableCell>{formatearPrecio(c.total)}</TableCell>
                  <TableCell>
                    <StatusChip texto={c.estadoTransaccion} relleno={c.estadoTransaccion === "Pendiente"} />
                  </TableCell>
                  <TableCell>
                    <StatusChip texto={c.estadoPedido} relleno={c.estadoPedido === "Enviado"} />
                  </TableCell>
                  <TableCell align="center">
                    <Link
                      component={RouterLink}
                      to={`/tienda/compras/${c.id}`}
                      sx={{ color: "text.primary", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      Ver detalle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, borderBottom: 0 }}>
                    {vacio}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PurchaseTable;
