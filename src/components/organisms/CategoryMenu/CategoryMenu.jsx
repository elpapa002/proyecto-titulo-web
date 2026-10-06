import { useState } from "react";
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useLocation } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NavItem from "../../molecules/NavItem/NavItem";
import CategoryIcon from "../../atoms/CategoryIcon/CategoryIcon";

const CategoryMenu = ({ categorias, onNavegar }) => {
  const location = useLocation();
  const [abiertas, setAbiertas] = useState([location.pathname.split("/")[2]]);

  const alternar = (ruta) => {
    if (abiertas.includes(ruta)) setAbiertas(abiertas.filter((r) => r !== ruta));
    else setAbiertas([...abiertas, ruta]);
  };

  return (
    <List disablePadding>
      {categorias.map((categoria) => {
        const abierta = abiertas.includes(categoria.ruta);
        return (
          <Box key={categoria.ruta}>
            <ListItemButton
              onClick={() => alternar(categoria.ruta)}
              aria-expanded={abierta}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: "secondary.main",
                "& .MuiListItemIcon-root": { color: "secondary.main", minWidth: 36 },
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon>
                <CategoryIcon ruta={categoria.ruta} />
              </ListItemIcon>
              <ListItemText primary={categoria.nombre} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
              {abierta ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>

            <Collapse in={abierta} timeout="auto" unmountOnExit>
              <List disablePadding>
                {categoria.subcategorias.map((sub) => (
                  <NavItem
                    key={sub.ruta}
                    ruta={`/catalogo/${categoria.ruta}/${sub.ruta}`}
                    texto={sub.nombre}
                    onClick={onNavegar}
                    sangria
                  />
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </List>
  );
};

export default CategoryMenu;
