import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Chip, Paper, Typography } from "@mui/material";
import { NavLink, useParams } from "react-router-dom";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import { obtenerCategorias } from "../../services/catalogService";

const CatalogScreen = () => {
  const { categoria: rutaCategoria, subcategoria: rutaSubcategoria } = useParams();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCategorias();
      if (respuesta.ok) setCategorias(respuesta.datos);
    };
    cargar();
  }, []);

  const categoria = categorias.find((c) => c.ruta === rutaCategoria);
  const subcategoria = categoria?.subcategorias.find((s) => s.ruta === rutaSubcategoria);

  if (!subcategoria) {
    return <PageHeader titulo="Catálogo" subtitulo={categorias.length ? "Esta subcategoría no existe." : "Cargando..."} />;
  }

  return (
    <>
      <PageHeader titulo={subcategoria.nombre} subtitulo={`Productos y servicios de ${categoria.nombre.toLowerCase()}.`} />

      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography>Catálogo</Typography>
        <Typography>{categoria.nombre}</Typography>
        <Typography sx={{ fontWeight: 600, color: "primary.main" }}>{subcategoria.nombre}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {categoria.subcategorias.map((sub) => (
          <Chip
            key={sub.ruta}
            label={sub.nombre}
            component={NavLink}
            to={`/catalogo/${categoria.ruta}/${sub.ruta}`}
            clickable
            color="primary"
            variant={sub.ruta === subcategoria.ruta ? "filled" : "outlined"}
            sx={{ ...(sub.ruta !== subcategoria.ruta && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 1.5, borderColor: "text.primary", textAlign: "center" }}>
        <Inventory2OutlinedIcon sx={{ fontSize: 40 }} />
        <Typography variant="h3" sx={{ mt: 1 }}>
          Todavía no hay productos para mostrar
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Los productos de esta subcategoría se van a cargar cuando el catálogo esté conectado al backend.
        </Typography>
      </Paper>
    </>
  );
};

export default CatalogScreen;
