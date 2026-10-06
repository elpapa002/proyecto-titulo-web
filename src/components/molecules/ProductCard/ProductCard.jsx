import { Box, Chip, IconButton, Paper, Rating, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { formatearPrecio, porcentajeDescuento } from "../../../utils/formato";

const ProductCard = ({ producto, favorito = false, onFavorito }) => {
  const descuento = porcentajeDescuento(producto);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        borderColor: "text.primary",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 120,
          display: "grid",
          placeItems: "center",
          borderBottom: "1px solid",
          borderColor: "text.primary",
        }}
      >
        {producto.tipo === "Servicio" ? (
          <ScheduleOutlinedIcon sx={{ fontSize: 32 }} />
        ) : (
          <ImageOutlinedIcon sx={{ fontSize: 32 }} />
        )}
        {descuento > 0 && (
          <Chip
            label={`−${descuento}%`}
            size="small"
            color="primary"
            sx={{ position: "absolute", top: 8, left: 8, height: 22, fontSize: 12 }}
          />
        )}
        {onFavorito && (
          <IconButton
            size="small"
            onClick={() => onFavorito(producto.id)}
            aria-pressed={favorito}
            aria-label={favorito ? `Quitar ${producto.nombre} de deseos` : `Agregar ${producto.nombre} a deseos`}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              border: "1px solid",
              borderColor: "text.primary",
              bgcolor: "secondary.main",
              "&:hover": { bgcolor: "secondary.main" },
            }}
          >
            {favorito ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5, flexGrow: 1 }}>
        <Typography variant="body2">{producto.tienda}</Typography>
        <Typography sx={{ fontWeight: 600 }}>{producto.nombre}</Typography>
        {producto.resenas > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Rating
              value={producto.calificacion}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: "primary.main" }}
            />
            <Typography variant="body2">
              {producto.calificacion.toLocaleString("es-CL")} ({producto.resenas})
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: "auto", pt: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "primary.main" }}>
            {formatearPrecio(producto.precioOferta ?? producto.precio)}
          </Typography>
          {producto.precioOferta && (
            <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
              {formatearPrecio(producto.precio)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductCard;
