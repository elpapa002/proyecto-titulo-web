import { Box, Paper, Typography } from "@mui/material";

const StatCard = ({ icono, titulo, valor, detalle }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: "text.primary", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "text.primary",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icono}
        </Box>
        <Typography sx={{ fontSize: 14 }}>{titulo}</Typography>
      </Box>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>{valor}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {detalle}
      </Typography>
    </Paper>
  );
};

export default StatCard;
