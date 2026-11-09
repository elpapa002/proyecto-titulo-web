import { useState } from "react";
import { Box, Chip, Grid, Link, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearFecha, formatearPrecio, normalizar } from "../../../utils/formato";

const POR_PAGINA = 8;
const ESTADOS_PEDIDO = ["Pagado", "En preparación", "Enviado", "Entregado", "Cancelado"];

const filtros = [{ valor: "todos", texto: "Todos", cumple: () => true }].concat(
  ESTADOS_PEDIDO.map((estado) => ({ valor: estado, texto: estado, cumple: (v) => v.estadoPedido === estado }))
);

const textoProductos = (venta) => {
  const unidades = venta.items.reduce((suma, item) => suma + item.cantidad, 0);
  return `${unidades} ${unidades === 1 ? "producto" : "productos"}`;
};

const porAtender = (venta) => venta.estadoPedido === "Pagado" || venta.estadoPedido === "En preparación";

const SalesTable = ({ ventas, cargando }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const filtroActual = filtros.find((f) => f.valor === filtro);
  const filtradas = ventas.filter((v) => {
    const texto = normalizar(`${v.id} ${v.cliente}`);
    return texto.includes(normalizar(busqueda.trim())) && filtroActual.cumple(v);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const cambiarFiltro = (valor) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ alignItems: "flex-end", mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SearchBar label="Buscar venta" placeholder="Número de pedido o cliente" value={busqueda} onChange={cambiarBusqueda} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pb: 0.5 }}>
            {filtros.map((f) => (
              <Chip
                key={f.valor}
                label={`${f.texto} (${ventas.filter(f.cumple).length})`}
                color="primary"
                variant={filtro === f.valor ? "filled" : "outlined"}
                onClick={() => cambiarFiltro(f.valor)}
                sx={{ ...(filtro !== f.valor && { color: "text.primary", borderColor: "text.primary" }) }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
        <Table sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Transacción</TableCell>
              <TableCell>Pedido</TableCell>
              <TableCell align="center">Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibles.map((venta) => (
              <TableRow key={venta.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ fontWeight: 600 }}>{venta.id}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFecha(venta.fecha)}</TableCell>
                <TableCell>{venta.cliente}</TableCell>
                <TableCell>{textoProductos(venta)}</TableCell>
                <TableCell>{formatearPrecio(venta.total)}</TableCell>
                <TableCell>
                  <StatusChip texto={venta.estadoTransaccion} />
                </TableCell>
                <TableCell>
                  <StatusChip texto={venta.estadoPedido} relleno={porAtender(venta)} />
                </TableCell>
                <TableCell align="center">
                  <Link
                    component={RouterLink}
                    to={`/mi-tienda/ventas/${venta.id}`}
                    aria-label={`Ver venta ${venta.id}`}
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  {cargando ? "Cargando ventas..." : "No hay ventas que coincidan con la búsqueda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={totalPaginas}
          page={paginaActual}
          onChange={(_, valor) => setPagina(valor)}
          variant="outlined"
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default SalesTable;
