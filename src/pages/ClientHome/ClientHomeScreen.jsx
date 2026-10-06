import { useEffect, useState } from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import { useOutletContext, useSearchParams } from "react-router-dom";
import OfferBanner from "../../components/organisms/OfferBanner/OfferBanner";
import ProductGrid from "../../components/organisms/ProductGrid/ProductGrid";
import CategoryCard from "../../components/molecules/CategoryCard/CategoryCard";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerProductos } from "../../services/productService";
import { obtenerCategorias } from "../../services/catalogService";
import { normalizar } from "../../utils/formato";

const ClientHomeScreen = () => {
  const { usuario } = useUser();
  const { favoritos, alternarFavorito } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const buscar = params.get("buscar") ?? "";
  const rutaCategoria = params.get("categoria") ?? "";
  const vista = params.get("vista") ?? "";

  useEffect(() => {
    const cargar = async () => {
      const [respuestaProductos, respuestaCategorias] = await Promise.all([obtenerProductos(), obtenerCategorias()]);
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      if (respuestaCategorias.ok) setCategorias(respuestaCategorias.datos);
      setCargando(false);
    };
    cargar();
  }, []);

  const categoria = categorias.find((c) => c.ruta === rutaCategoria);
  const filtrando = Boolean(buscar || rutaCategoria || vista);

  const resultados = productos.filter((p) => {
    const texto = normalizar(`${p.nombre} ${p.tienda} ${p.descripcion}`);
    if (buscar && !texto.includes(normalizar(buscar))) return false;
    if (rutaCategoria && p.categoriaId !== categoria?.id) return false;
    if (vista === "ofertas" && !p.precioOferta) return false;
    if (vista === "deseos" && !favoritos.includes(p.id)) return false;
    return true;
  });

  let tituloResultados = "Resultados";
  if (buscar) tituloResultados = `Resultados para «${buscar}»`;
  else if (categoria) tituloResultados = categoria.nombre;
  else if (vista === "ofertas") tituloResultados = "Ofertas de la semana";
  else if (vista === "deseos") tituloResultados = "Tu lista de deseos";

  const elegirCategoria = (ruta) => setParams(ruta === rutaCategoria ? {} : { categoria: ruta });

  return (
    <>
      {!filtrando && <OfferBanner onVerOfertas={() => setParams({ vista: "ofertas" })} />}

      {filtrando && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2">Hola, {usuario.nombres.split(" ")[0]}</Typography>
          <Link
            component="button"
            type="button"
            onClick={() => setParams({})}
            sx={{ color: "text.primary", fontWeight: 600, textDecorationColor: "inherit" }}
          >
            Volver al inicio
          </Link>
        </Box>
      )}

      <Box component="section" sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Categorías
        </Typography>
        <Grid container spacing={2}>
          {categorias.map((c) => (
            <Grid key={c.ruta} size={{ xs: 6, sm: 3 }}>
              <CategoryCard categoria={c} activa={c.ruta === rutaCategoria} onClick={() => elegirCategoria(c.ruta)} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {cargando ? (
        <Typography>Cargando productos...</Typography>
      ) : filtrando ? (
        <ProductGrid
          titulo={tituloResultados}
          productos={resultados}
          favoritos={favoritos}
          onFavorito={alternarFavorito}
          vacio={
            vista === "deseos"
              ? "Todavía no agregas productos a tu lista de deseos. Usa el corazón de cada producto."
              : "No encontramos productos con esa búsqueda."
          }
        />
      ) : (
        <>
          <ProductGrid
            titulo="Ofertas para ti"
            textoAccion="Ver todas las ofertas"
            onAccion={() => setParams({ vista: "ofertas" })}
            productos={productos.filter((p) => p.precioOferta).slice(0, 5)}
            favoritos={favoritos}
            onFavorito={alternarFavorito}
            vacio="No hay ofertas por ahora."
          />
          <ProductGrid
            titulo="Productos y servicios destacados"
            productos={productos.filter((p) => !p.precioOferta)}
            favoritos={favoritos}
            onFavorito={alternarFavorito}
            vacio="No hay productos publicados."
          />
        </>
      )}
    </>
  );
};

export default ClientHomeScreen;
