import { useState } from "react";
import { Box, Chip, Grid, IconButton, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import StatusChip from "../../atoms/StatusChip/StatusChip";
import { formatearPrecio, normalizar, porcentajeDescuento } from "../../../utils/formato";

const POR_PAGINA = 6;

const stockBajo = (p) => p.tipo === "Producto" && p.stock <= 3;

const textoStock = (p) => {
  if (p.tipo === "Servicio") return `${p.stock} cupos`;
  if (p.stock === 0) return "Sin stock";
  if (p.stock <= 3) return `Stock bajo: ${p.stock}`;
  return `${p.stock} unidades`;
};

const filtros = [
  { valor: "todas", texto: "Todas", cumple: () => true },
  { valor: "productos", texto: "Productos", cumple: (p) => p.tipo === "Producto" },
  { valor: "servicios", texto: "Servicios", cumple: (p) => p.tipo === "Servicio" },
  { valor: "oferta", texto: "Con oferta", cumple: (p) => Boolean(p.precioOferta) },
  { valor: "stock", texto: "Stock bajo", cumple: stockBajo },
];

const ProductTable = ({ productos, categorias, cargando, onEditar, onEliminar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);

  const nombreCategoria = (p) => {
    const categoria = categorias.find((c) => c.id === p.categoriaId);
    const sub = categoria?.subcategorias.find((s) => s.id === p.subcategoriaId);
    return categoria ? `${categoria.nombre} › ${sub?.nombre ?? ""}` : "";
  };

  const filtroActual = filtros.find((f) => f.valor === filtro);
  const filtrados = productos.filter((p) => {
    const texto = normalizar(`${p.nombre} ${p.sku}`);
    return texto.includes(normalizar(busqueda.trim())) && filtroActual.cumple(p);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

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
          <SearchBar label="Buscar publicación" placeholder="Nombre o SKU" value={busqueda} onChange={cambiarBusqueda} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pb: 0.5 }}>
            {filtros.map((f) => (
              <Chip
                key={f.valor}
                label={`${f.texto} (${productos.filter(f.cumple).length})`}
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
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Publicación</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock o cupos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibles.map((p) => (
              <TableRow key={p.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                      {p.tipo === "Servicio" ? (
                        <ScheduleOutlinedIcon fontSize="small" />
                      ) : (
                        <ImageOutlinedIcon fontSize="small" />
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
                      <Typography variant="body2">
                        {p.tipo === "Servicio" ? `Servicio · ${p.duracion}` : `SKU ${p.sku}`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell>{nombreCategoria(p)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatearPrecio(p.precioOferta ?? p.precio)}
                  {p.precioOferta && (
                    <Box component="span" sx={{ ml: 1 }}>
                      <StatusChip texto={`−${porcentajeDescuento(p)}%`} />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <StatusChip texto={textoStock(p)} relleno={stockBajo(p)} />
                </TableCell>
                <TableCell>
                  <StatusChip texto={p.estado} />
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEditar(p)} aria-label={`Editar ${p.nombre}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onEliminar(p)} aria-label={`Eliminar ${p.nombre}`}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  {cargando ? "Cargando publicaciones..." : "No hay publicaciones que coincidan con la búsqueda."}
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

export default ProductTable;
