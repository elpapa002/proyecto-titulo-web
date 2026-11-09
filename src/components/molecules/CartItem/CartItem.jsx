import { Box, IconButton, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import QuantitySelector from "../QuantitySelector/QuantitySelector";
import { formatearPrecio } from "../../../utils/formato";

const CartItem = ({ item, onCantidad, onQuitar }) => {
  const esServicio = item.tipo === "Servicio";

  return (
    <Box sx={{ display: "flex", gap: 2, py: 2 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          flexShrink: 0,
          border: "1px solid",
          borderColor: "text.primary",
          borderRadius: 1,
          display: { xs: "none", sm: "grid" },
          placeItems: "center",
        }}
      >
        {esServicio ? <ScheduleOutlinedIcon /> : <ImageOutlinedIcon />}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 2,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <Link
            component={RouterLink}
            to={`/tienda/producto/${item.productoId}`}
            underline="hover"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {item.nombre}
          </Link>
          <Typography variant="body2">
            {item.tienda}
            {esServicio ? " · Servicio" : ""}
          </Typography>
          <Typography>{formatearPrecio(item.precio)} c/u</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <QuantitySelector
              valor={item.cantidad}
              maximo={item.stock}
              onChange={onCantidad}
              etiqueta={`Cantidad de ${item.nombre}`}
            />
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Máx. {item.stock} ({esServicio ? "cupos" : "stock"})
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, minWidth: 76, textAlign: "right", mb: 2.5 }}>
            {formatearPrecio(item.precio * item.cantidad)}
          </Typography>
          <IconButton onClick={onQuitar} aria-label={`Quitar ${item.nombre} del carro`} sx={{ color: "text.primary", mb: 2.5 }}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CartItem;
