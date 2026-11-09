import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ProductGrid from "../../components/organisms/ProductGrid/ProductGrid";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { obtenerProductos } from "../../services/productService";

const WishlistScreen = () => {
  const navigate = useNavigate();
  const { favoritos, alternarFavorito } = useOutletContext();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerProductos();
      if (respuesta.ok) setProductos(respuesta.datos);
      else setError("No se pudieron cargar tus productos guardados.");
      setCargando(false);
    };
    cargar();
  }, []);

  const guardados = productos.filter((p) => favoritos.includes(p.id));
  const cantidad = guardados.length;

  const quitar = (id) => {
    const producto = productos.find((p) => p.id === id);
    console.log("Producto quitado de deseos:", { id, nombre: producto?.nombre });
    alternarFavorito(id);
  };

  return (
    <>
      <PageHeader
        titulo="Mi lista de deseos"
        subtitulo={
          cargando
            ? "Cargando..."
            : `${cantidad} ${cantidad === 1 ? "producto o servicio guardado" : "productos y servicios guardados"}`
        }
      />

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          border: "1px solid",
          borderColor: "text.primary",
          borderRadius: 1,
          p: 1.25,
          mb: 3,
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
        <Typography>
          Guarda lo que te interesa para comprarlo después. Toca el corazón de un producto para agregarlo o quitarlo de
          esta lista.
        </Typography>
      </Box>

      {cargando ? (
        <Typography>Cargando productos guardados...</Typography>
      ) : error ? (
        <Typography>{error}</Typography>
      ) : (
        <>
          <ProductGrid
            titulo="Guardados"
            productos={guardados}
            favoritos={favoritos}
            onFavorito={quitar}
            vacio="Todavía no guardas nada. En la tienda o en la ficha de un producto toca el corazón o el botón 'Guardar' y aparecerá aquí."
          />
          {cantidad === 0 && (
            <Box sx={{ textAlign: "center", mt: -2 }}>
              <CustomButton onClick={() => navigate("/tienda")}>Ir a la tienda</CustomButton>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default WishlistScreen;
