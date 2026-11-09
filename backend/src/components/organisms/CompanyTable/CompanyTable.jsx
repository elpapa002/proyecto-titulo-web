import { useState } from "react";
import {
  Box,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { nombreCorto, normalizar } from "../../../utils/formato";
import { limpiarRut } from "../../../utils/rut";

const POR_PAGINA = 5;

const CompanyTable = ({ companias, usuarios, cargando, onAgregar, onEditar, onEliminar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const emprendedores = (compania) =>
    usuarios
      .filter((u) => u.companiaId === compania.id && u.roles.includes("Vendedor"))
      .map(nombreCorto)
      .join(", ") || "Sin emprendedor";

  const filtradas = companias.filter((c) =>
    normalizar(`${c.rut} ${limpiarRut(c.rut)} ${c.nombre}`).includes(normalizar(busqueda.trim()))
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Box sx={{ flex: "1 1 320px" }}>
          <SearchBar
            placeholder="RUT o nombre de la empresa"
            value={busqueda}
            onChange={(valor) => {
              setBusqueda(valor);
              setPagina(1);
            }}
          />
        </Box>
        <CustomButton onClick={onAgregar} startIcon={<AddBusinessOutlinedIcon />} sx={{ minHeight: 44 }}>
          Agregar compañía
        </CustomButton>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
        <Table sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow>
              <TableCell>RUT</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Personas</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Emprendedor</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibles.map((c) => (
              <TableRow key={c.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{c.rut}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{c.nombre}</Typography>
                  <Typography variant="body2">{c.sitioWeb || "Sin sitio web"}</Typography>
                </TableCell>
                <TableCell>{c.personas}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{c.telefono}</Typography>
                  <Typography variant="body2">{c.correo}</Typography>
                </TableCell>
                <TableCell>{emprendedores(c)}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEditar(c)} aria-label={`Editar ${c.nombre}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onEliminar(c)} aria-label={`Eliminar ${c.nombre}`}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  {cargando ? "Cargando compañías..." : "No hay compañías que coincidan con la búsqueda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 2 }}>
        <Pagination
          count={totalPaginas}
          page={paginaActual}
          onChange={(_, valor) => setPagina(valor)}
          variant="outlined"
          shape="rounded"
          color="primary"
        />
        <Typography variant="body2">
          Mostrando {visibles.length} de {filtradas.length} compañías
        </Typography>
      </Box>
    </Paper>
  );
};

export default CompanyTable;
