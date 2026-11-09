import { Avatar, Box, Grid, Paper, Rating, Typography } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { formatearFecha } from "../../../utils/formato";

const estiloEstrellas = { color: "primary.main", "& .MuiRating-iconEmpty": { color: "primary.main" } };

const ProductReviews = ({ calificaciones, promedio, resenas }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary", mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Typography variant="h3">Calificaciones del producto</Typography>
        {resenas > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "primary.main" }}>
              {promedio.toLocaleString("es-CL")}
            </Typography>
            <Rating
              value={promedio}
              precision={0.1}
              readOnly
              size="small"
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              sx={estiloEstrellas}
            />
            <Typography variant="body2">
              {resenas} {resenas === 1 ? "reseña" : "reseñas"}
            </Typography>
          </Box>
        )}
      </Box>

      {calificaciones.length === 0 ? (
        <Typography>
          {resenas > 0
            ? "Todavía no hay comentarios escritos de compradores."
            : "Este producto todavía no tiene calificaciones. Las dejan quienes ya lo compraron."}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {calificaciones.map((calificacion) => (
            <Grid key={calificacion.id} size={{ xs: 12, md: 6 }}>
              <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.5, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main", color: "secondary.main" }}>
                    {calificacion.cliente[0]}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>{calificacion.cliente}</Typography>
                  <Rating
                    value={calificacion.notaProducto}
                    readOnly
                    size="small"
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    sx={estiloEstrellas}
                  />
                  <Typography variant="body2">{formatearFecha(calificacion.fecha)}</Typography>
                </Box>
                <Typography>{calificacion.comentario}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default ProductReviews;
