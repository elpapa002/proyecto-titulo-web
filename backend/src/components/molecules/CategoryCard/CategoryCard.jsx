import { Box, ButtonBase, Typography } from "@mui/material";
import CategoryIcon from "../../atoms/CategoryIcon/CategoryIcon";

const CategoryCard = ({ categoria, activa = false, onClick }) => {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={activa}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        p: 2,
        border: "1px solid",
        borderColor: "text.primary",
        borderRadius: 1.5,
        bgcolor: activa ? "primary.main" : "secondary.main",
        color: activa ? "secondary.main" : "text.primary",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "currentColor",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CategoryIcon ruta={categoria.ruta} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{categoria.nombre}</Typography>
    </ButtonBase>
  );
};

export default CategoryCard;
