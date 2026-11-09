import { useState } from "react";
import { Box, Collapse, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CategoryIcon from "../../atoms/CategoryIcon/CategoryIcon";
import { normalizar } from "../../../utils/formato";

const textoSubcategorias = (cantidad) => {
  if (cantidad === 0) return "Sin subcategorías";
  return `${cantidad} ${cantidad === 1 ? "subcategoría" : "subcategorías"}`;
};

const CategoryTree = ({ categorias, busqueda, cargando, onAgregarSub, onEditar, onEliminar }) => {
  const [cerradas, setCerradas] = useState([]);
  const termino = normalizar(busqueda.trim());
  const buscando = termino !== "";
  const coincide = (categoria) => normalizar(categoria.nombre).includes(termino);

  const visibles = categorias
    .map((categoria) => ({
      categoria,
      subcategorias: coincide(categoria) ? categoria.subcategorias : categoria.subcategorias.filter(coincide),
    }))
    .filter((fila) => coincide(fila.categoria) || fila.subcategorias.length > 0);

  const alternar = (id) => {
    if (cerradas.includes(id)) setCerradas(cerradas.filter((c) => c !== id));
    else setCerradas([...cerradas, id]);
  };

  const acciones = (categoria) => (
    <Box sx={{ display: "flex", flexShrink: 0 }}>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={() => onEditar(categoria)} aria-label={`Editar ${categoria.nombre}`}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" onClick={() => onEliminar(categoria)} aria-label={`Eliminar ${categoria.nombre}`}>
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (visibles.length === 0) {
    return (
      <Typography sx={{ py: 4, textAlign: "center" }}>
        {cargando
          ? "Cargando categorías..."
          : buscando
            ? "No hay categorías que coincidan con la búsqueda."
            : "Todavía no hay categorías."}
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {visibles.map(({ categoria, subcategorias }) => {
        const abierta = buscando || !cerradas.includes(categoria.id);
        const cantidad = categoria.subcategorias.length;
        return (
          <Box
            key={categoria.id}
            sx={{ borderBottom: "1px solid", borderColor: "text.primary", "&:last-child": { borderBottom: 0 } }}
          >
            <ListItem disablePadding sx={{ py: 0.75, gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => alternar(categoria.id)}
                disabled={cantidad === 0 || buscando}
                aria-expanded={abierta}
                aria-label={abierta ? `Cerrar ${categoria.nombre}` : `Abrir ${categoria.nombre}`}
              >
                {abierta && cantidad > 0 ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
              <CategoryIcon ruta={categoria.ruta} />
              <ListItemText
                primary={categoria.nombre}
                secondary={textoSubcategorias(cantidad)}
                sx={{ minWidth: 0 }}
                slotProps={{
                  primary: { sx: { fontWeight: 600, fontSize: 14 } },
                  secondary: { sx: { fontSize: 12, color: "text.primary" } },
                }}
              />
              <Tooltip title="Agregar subcategoría">
                <IconButton
                  size="small"
                  onClick={() => onAgregarSub(categoria)}
                  aria-label={`Agregar subcategoría a ${categoria.nombre}`}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {acciones(categoria)}
            </ListItem>

            <Collapse in={abierta && subcategorias.length > 0} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ pb: 0.75 }}>
                {subcategorias.map((sub) => (
                  <ListItem key={sub.id} disablePadding sx={{ pl: { xs: 4.5, sm: 7 }, py: 0.25, gap: 1 }}>
                    <LocalOfferOutlinedIcon fontSize="small" />
                    <ListItemText
                      primary={sub.nombre}
                      sx={{ minWidth: 0 }}
                      slotProps={{ primary: { sx: { fontSize: 14 } } }}
                    />
                    {acciones(sub)}
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </List>
  );
};

export default CategoryTree;
