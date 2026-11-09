import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const pasos = ["Carro", "Despacho", "Pago", "Confirmación"];

const IconoPaso = ({ active, completed, icon }) => {
  const marcado = active || completed;
  return (
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
        bgcolor: marcado ? "primary.main" : "secondary.main",
        color: marcado ? "secondary.main" : "primary.main",
      }}
    >
      {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : icon}
    </Box>
  );
};

const CheckoutSteps = ({ actual, esMovil = false }) => {
  const pasoActivo = actual === pasos.length ? pasos.length : actual - 1;

  return (
    <Box component="nav" aria-label="Pasos de la compra" sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ textAlign: "center", mb: 1.5, fontWeight: 600 }}>
        Paso {actual} de {pasos.length}
      </Typography>
      <Stepper
        activeStep={pasoActivo}
        alternativeLabel={esMovil}
        sx={{
          maxWidth: 640,
          mx: "auto",
          "& .MuiStepConnector-line": { borderColor: "primary.main", borderTopWidth: 2 },
          "& .MuiStepLabel-label": { fontSize: esMovil ? 12 : 14, color: "text.primary", mt: esMovil ? "6px !important" : 0 },
          "& .MuiStepLabel-label.Mui-active": { fontWeight: 600, color: "primary.main" },
          "& .MuiStepLabel-label.Mui-completed": { color: "text.primary" },
        }}
      >
        {pasos.map((paso) => (
          <Step key={paso}>
            <StepLabel slots={{ stepIcon: IconoPaso }}>{paso}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CheckoutSteps;
