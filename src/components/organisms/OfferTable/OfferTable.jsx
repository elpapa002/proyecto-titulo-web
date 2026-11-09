import { useState } from "react";
import { Box, Chip, Grid, IconButton, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearFecha, formatearPrecio, normalizar, porcentajeDescuento } from "../../../utils/formato";

const POR_PAGINA = 6;

const filtros = [
  { valor: "todas", texto: "Todas", cumple: () => true },
  { valor: "Activa", texto: "Activas", cumple: (o) => o.estado === "Activa" },
  { valor: "Programada", texto: "Programadas", cumple: (o) => o.estado === "Programada" },
  { valor: "Terminada", texto: "Terminadas", cumple: (o) => o.estado === "Terminada" },
];

const OfferTable = ({ ofertas, cargando, onEditar, onEliminar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);

  const filtroActual = filtros.find((f) => f.valor === filtro);
  const filtradas = ofertas.filter(
    (o) => normalizar(o.nombreProducto).includes(normalizar(busqueda.trim())) && filtroActual.cumple(o)
  );

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
          <SearchBar
            label="Buscar oferta"
            placeholder="Nombre del producto"
            value={busqueda}
            onChange={cambiarBusqueda}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pb: 0.5 }}>
            {filtros.map((f) => (
              <Chip
                key={f.valor}
                label={`${f.texto} (${ofertas.filter(f.cumple).length})`}
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
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Publicación</TableCell>
              <TableCell>Precio normal</TableCell>
              <TableCell>Precio de oferta</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell>Desde</TableCell>
              <TableCell>Hasta</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Aviso a clientes</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibles.map((o) => (
              <TableRow key={o.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{o.nombreProducto}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearPrecio(o.precio)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{formatearPrecio(o.precioOferta)}</TableCell>
                <TableCell>
                  <StatusChip texto={`−${porcentajeDescuento(o)}%`} />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFecha(o.inicio)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFecha(o.fin)}</TableCell>
                <TableCell>
                  <StatusChip texto={o.estado} relleno={o.estado === "Activa"} />
                </TableCell>
                <TableCell>{o.difundir ? "Sí, se avisó" : "No"}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEditar(o)} aria-label={`Editar oferta de ${o.nombreProducto}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onEliminar(o)} aria-label={`Eliminar oferta de ${o.nombreProducto}`}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  {cargando
                    ? "Cargando ofertas..."
                    : ofertas.length === 0
                      ? "Todavía no tienes ofertas. Usa 'Crear oferta' para empezar."
                      : "No hay ofertas que coincidan con la búsqueda."}
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

export default OfferTable;
