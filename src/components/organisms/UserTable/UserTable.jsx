import { useState } from "react";
import { Box, Chip, Grid, IconButton, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import RoleChip from "../../atoms/RoleChip/RoleChip";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import SelectField from "../../molecules/SelectField/SelectField";
import { formatearFecha, nombreCompania, nombreCorto, normalizar } from "../../../utils/formato";
import { limpiarRut } from "../../../utils/rut";

const POR_PAGINA = 6;
const ROLES = ["Cliente", "Vendedor", "Admin"];

const UserTable = ({ usuarios, companias, cargando, onAgregar, onEditar, onEliminar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("todos");
  const [anio, setAnio] = useState("todas");
  const [pagina, setPagina] = useState(1);

  const anios = [...new Set(usuarios.map((u) => u.fechaIngreso.slice(0, 4)))].sort().reverse();
  const contar = (r) => usuarios.filter((u) => u.roles.includes(r)).length;

  const filtrados = usuarios.filter((u) => {
    const texto = normalizar(
      `${u.run} ${limpiarRut(u.run)} ${u.nombres} ${u.apellidos} ${nombreCompania(u, companias)}`
    );
    const coincideBusqueda = texto.includes(normalizar(busqueda.trim()));
    const coincideRol = rol === "todos" || u.roles.includes(rol);
    const coincideAnio = anio === "todas" || u.fechaIngreso.startsWith(anio);
    return coincideBusqueda && coincideRol && coincideAnio;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarFiltro = (setter) => (valor) => {
    setter(valor);
    setPagina(1);
  };

  const chips = [{ valor: "todos", texto: `Todos (${usuarios.length})` }].concat(
    ROLES.map((r) => ({ valor: r, texto: `${r} (${contar(r)})` }))
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, borderColor: "text.primary" }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SearchBar placeholder="RUT, nombre o compañía" value={busqueda} onChange={cambiarFiltro(setBusqueda)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            label="Filtrar por rol"
            value={rol}
            onChange={(e) => cambiarFiltro(setRol)(e.target.value)}
            opciones={[{ valor: "todos", texto: "Todos los roles" }, ...ROLES.map((r) => ({ valor: r, texto: r }))]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            label="Fecha de ingreso"
            value={anio}
            onChange={(e) => cambiarFiltro(setAnio)(e.target.value)}
            opciones={[{ valor: "todas", texto: "Todas" }, ...anios.map((a) => ({ valor: a, texto: `Año ${a}` }))]}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", my: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Rol:</Typography>
        {chips.map((chip) => (
          <Chip
            key={chip.valor}
            label={chip.texto}
            color="primary"
            variant={rol === chip.valor ? "filled" : "outlined"}
            onClick={() => cambiarFiltro(setRol)(chip.valor)}
            sx={{ ...(rol !== chip.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
        <Table sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow>
              <TableCell>RUT</TableCell>
              <TableCell>Fecha de ingreso</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Compañía</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibles.map((u) => (
              <TableRow key={u.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{u.run}</TableCell>
                <TableCell>{formatearFecha(u.fechaIngreso)}</TableCell>
                <TableCell>{nombreCorto(u)}</TableCell>
                <TableCell>{nombreCompania(u, companias)}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {u.roles.map((r) => (
                      <RoleChip key={r} rol={r} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEditar(u)} aria-label={`Editar a ${nombreCorto(u)}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onEliminar(u)} aria-label={`Eliminar a ${nombreCorto(u)}`}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, borderBottom: 0 }}>
                  {cargando ? "Cargando usuarios..." : "No hay usuarios que coincidan con la búsqueda."}
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
        <CustomButton onClick={onAgregar} startIcon={<PersonAddAltOutlinedIcon />}>
          Añadir usuario
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default UserTable;
