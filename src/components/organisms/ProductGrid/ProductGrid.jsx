import { Box, Grid, Link, Paper, Typography } from "@mui/material";
import ProductCard from "../../molecules/ProductCard/ProductCard";

const ProductGrid = ({ titulo, textoAccion, onAccion, productos, favoritos = [], onFavorito, vacio }) => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h2">{titulo}</Typography>
        {textoAccion && (
          <Link
            component="button"
            type="button"
            onClick={onAccion}
            sx={{ color: "text.primary", fontWeight: 600, fontSize: 13, textDecorationColor: "inherit" }}
          >
            {textoAccion}
          </Link>
        )}
      </Box>

      {productos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 1.5, borderColor: "text.primary", textAlign: "center" }}>
          <Typography>{vacio}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
          {productos.map((producto) => (
            <Grid key={producto.id} size={1}>
              <ProductCard
                producto={producto}
                favorito={favoritos.includes(producto.id)}
                onFavorito={onFavorito}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductGrid;
