import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

const PurchaseSummary = ({ titulo = "Resumen de la compra", filas, total, children }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        {titulo}
      </Typography>
      <Stack spacing={1.25}>
        {filas.map((fila) => (
          <Box key={fila.texto} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography>{fila.texto}</Typography>
            <Typography sx={{ textAlign: "right" }}>{fila.valor}</Typography>
          </Box>
        ))}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>{total.texto}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: "primary.main" }}>{total.valor}</Typography>
      </Box>
      <Stack spacing={1}>{children}</Stack>
    </Paper>
  );
};

export default PurchaseSummary;
