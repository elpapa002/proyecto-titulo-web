import { Box, LinearProgress, Paper, Rating, Typography } from "@mui/material";

const RatingSummary = ({ promedio, resenas, calificaciones }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Typography variant="h3" sx={{ mb: 1.5 }}>
        Calificación promedio
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 700, color: "primary.main", lineHeight: 1 }}>
          {resenas ? String(promedio).replace(".", ",") : "-"}
        </Typography>
        <Rating value={promedio} precision={0.5} readOnly size="small" sx={{ color: "primary.main" }} />
        <Typography variant="body2">
          {resenas} {resenas === 1 ? "reseña" : "reseñas"}
        </Typography>
      </Box>
      {calificaciones.map((fila) => (
        <Box
          key={fila.estrellas}
          sx={{ display: "grid", gridTemplateColumns: "36px 1fr 40px", alignItems: "center", gap: 1.5, mb: 1.25 }}
        >
          <Typography sx={{ fontSize: 14 }}>{fila.estrellas} ★</Typography>
          <LinearProgress
            variant="determinate"
            value={fila.porcentaje}
            aria-label={`${fila.estrellas} estrellas: ${fila.porcentaje}%`}
            sx={{ height: 10, borderRadius: 5, bgcolor: "secondary.main", border: "1px solid", borderColor: "primary.main" }}
          />
          <Typography variant="body2" sx={{ textAlign: "right" }}>
            {fila.porcentaje}%
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default RatingSummary;
