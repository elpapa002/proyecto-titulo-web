import { Box, Paper, Typography } from "@mui/material";

const ALTO = 180;

const SalesChart = ({ datos }) => {
  const maximo = Math.max(...datos.map((d) => d.valor));
  const promedio = datos.reduce((suma, d) => suma + d.valor, 0) / datos.length;
  const formatear = (valor) => `$${valor.toFixed(2).replace(".", ",")} M`;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Typography variant="h3">Ventas por mes de toda la plataforma</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 24, borderTop: "2px dashed", borderColor: "text.primary" }} />
          <Typography variant="body2">Promedio mensual</Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative", height: ALTO, display: "flex", alignItems: "flex-end", gap: 2, px: 1 }}>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: (promedio / maximo) * ALTO,
            borderTop: "2px dashed",
            borderColor: "text.primary",
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ position: "absolute", top: -20, left: 0, fontWeight: 500 }}>
            Promedio {formatear(promedio)}
          </Typography>
        </Box>
        {datos.map((d, i) => (
          <Box
            key={d.mes}
            title={`${d.mes}: ${formatear(d.valor)}`}
            sx={{
              flex: 1,
              height: (d.valor / maximo) * ALTO,
              border: "1.5px solid",
              borderColor: "primary.main",
              bgcolor: i === datos.length - 1 ? "primary.main" : "secondary.main",
              borderRadius: "6px 6px 0 0",
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, px: 1, mt: 1 }}>
        {datos.map((d) => (
          <Box key={d.mes} sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13 }}>{d.mes}</Typography>
            <Typography variant="body2">{formatear(d.valor)}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default SalesChart;
