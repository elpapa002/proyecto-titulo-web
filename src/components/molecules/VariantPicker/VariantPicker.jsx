import { Box, ButtonBase, Typography } from "@mui/material";

const textoVariante = (v) => [v.talla && `Talla ${v.talla}`, v.color].filter(Boolean).join(" · ");

// botones para elegir la talla y color; las variantes sin stock quedan deshabilitadas
const VariantPicker = ({ variantes, elegida, onElegir }) => (
  <Box>
    <Typography sx={{ fontWeight: 600, mb: 1 }} id="titulo-variantes">
      Elige talla y color
    </Typography>
    <Box role="radiogroup" aria-labelledby="titulo-variantes" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {variantes.map((v) => {
        const activa = v.id === elegida;
        const agotada = v.stock <= 0;
        return (
          <ButtonBase
            key={v.id}
            role="radio"
            aria-checked={activa}
            disabled={agotada}
            onClick={() => onElegir(v.id)}
            sx={{
              border: activa ? "2px solid" : "1px solid",
              borderColor: activa ? "primary.main" : "text.primary",
              borderRadius: 1,
              px: activa ? "11px" : 1.5,
              py: activa ? "5px" : 0.75,
              fontSize: 14,
              fontWeight: activa ? 700 : 500,
              color: "text.primary",
              opacity: agotada ? 0.45 : 1,
              textDecoration: agotada ? "line-through" : "none",
            }}
          >
            {textoVariante(v)}
          </ButtonBase>
        );
      })}
    </Box>
  </Box>
);

export default VariantPicker;
