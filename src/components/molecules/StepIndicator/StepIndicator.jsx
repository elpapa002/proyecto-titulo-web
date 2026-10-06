import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const StepIndicator = ({ pasos, actual }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
      {pasos.map((texto, i) => {
        const numero = i + 1;
        const completo = numero < actual;
        const esActual = numero === actual;
        return (
          <Box key={texto} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1.5px solid",
                  borderColor: "primary.main",
                  bgcolor: completo || esActual ? "primary.main" : "secondary.main",
                  color: completo || esActual ? "secondary.main" : "primary.main",
                }}
              >
                {completo ? <CheckIcon sx={{ fontSize: 16 }} /> : numero}
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: esActual ? 600 : 400 }}>{texto}</Typography>
            </Box>
            {numero < pasos.length && <Box sx={{ width: 40, height: 2, bgcolor: "primary.main" }} />}
          </Box>
        );
      })}
    </Box>
  );
};

export default StepIndicator;
