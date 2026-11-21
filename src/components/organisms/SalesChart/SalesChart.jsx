import { Box, Paper, Typography } from "@mui/material";

const ALTO = 180;

// $1,28 M o $147 mil para que quepa sobre la barra
const corto = (valor) => {
  if (valor >= 1000000) return `$${(valor / 1000000).toFixed(2).replace(".", ",")} M`;
  if (valor >= 1000) return `$${Math.round(valor / 1000)} mil`;
  return `$${valor}`;
};

const SalesChart = ({ titulo, datos, nota }) => {
  const maximo = Math.max(1, ...datos.map((d) => d.total));
  const promedio = datos.length ? datos.reduce((suma, d) => suma + d.total, 0) / datos.length : 0;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Typography variant="h3">{titulo}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 24, borderTop: "2px dashed", borderColor: "text.primary" }} />
          <Typography variant="body2">Promedio mensual {corto(Math.round(promedio))}</Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative", height: ALTO, display: "flex", alignItems: "flex-end", gap: { xs: 0.5, sm: 2 }, px: 1 }}>
        {promedio > 0 && (
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
          />
        )}
        {datos.map((d, i) => (
          <Box
            key={d.mes}
            title={`${d.etiqueta}: ${corto(d.total)} en ${d.pedidos} ${d.pedidos === 1 ? "pedido" : "pedidos"}`}
            sx={{
              flex: 1,
              height: Math.max(2, (d.total / maximo) * ALTO),
              border: "1.5px solid",
              borderColor: "primary.main",
              bgcolor: i === datos.length - 1 ? "primary.main" : "secondary.main",
              borderRadius: "6px 6px 0 0",
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 2 }, px: 1, mt: 1 }}>
        {datos.map((d) => (
          <Box key={d.mes} sx={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <Typography sx={{ fontSize: 13 }}>{d.etiqueta}</Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: 10, sm: 12 } }}>
              {corto(d.total)}
            </Typography>
          </Box>
        ))}
      </Box>

      {nota && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {nota}
        </Typography>
      )}
    </Paper>
  );
};

export default SalesChart;
