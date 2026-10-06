import { Box, Chip, Paper, Typography } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import CustomButton from "../../atoms/Button/CustomButton";

const OfferBanner = ({ onVerOfertas }) => {
  return (
    <Paper
      sx={{
        bgcolor: "primary.main",
        color: "secondary.main",
        borderRadius: 2,
        p: { xs: 3, md: 4 },
        mb: 4,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Chip label="Ofertas de la semana" size="small" sx={{ bgcolor: "secondary.main", color: "primary.main", mb: 1.5 }} />
        <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700 }}>
          Ofertas de emprendedores del sur
        </Typography>
        <Typography sx={{ mt: 1, mb: 2.5 }}>Hasta 20% de descuento en productos y servicios seleccionados.</Typography>
        <CustomButton tono="claro" onClick={onVerOfertas}>
          Ver ofertas
        </CustomButton>
      </Box>
      <Box
        sx={{
          flex: 1,
          maxWidth: 300,
          height: 150,
          bgcolor: "secondary.main",
          borderRadius: 1.5,
          display: { xs: "none", md: "grid" },
          placeItems: "center",
          color: "primary.main",
        }}
      >
        <PercentIcon sx={{ fontSize: 48 }} />
      </Box>
    </Paper>
  );
};

export default OfferBanner;
