import { useState } from "react";
import { Box, ButtonBase, Paper } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { urlFoto } from "../../../services/api";

const marco = { borderRadius: 1.5, borderColor: "text.primary", overflow: "hidden" };

// foto principal grande y miniaturas para cambiarla
const ProductGallery = ({ producto }) => {
  const [actual, setActual] = useState(0);
  const fotos = producto.fotos ?? [];

  if (fotos.length === 0) {
    return (
      <Paper variant="outlined" sx={{ ...marco, height: { xs: 240, md: 400 }, display: "grid", placeItems: "center" }} aria-label="Sin fotos por ahora">
        {producto.tipo === "Servicio" ? (
          <ScheduleOutlinedIcon sx={{ fontSize: 96, color: "text.primary" }} />
        ) : (
          <ImageOutlinedIcon sx={{ fontSize: 96, color: "text.primary" }} />
        )}
      </Paper>
    );
  }

  const textoDe = (i) => (i === 0 && producto.textoAlternativo ? producto.textoAlternativo : `${producto.nombre}, foto ${i + 1}`);

  return (
    <Box>
      <Paper variant="outlined" sx={{ ...marco, height: { xs: 240, md: 400 } }}>
        <Box component="img" src={urlFoto(fotos[actual])} alt={textoDe(actual)} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </Paper>
      {fotos.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {fotos.map((foto, i) => (
            <ButtonBase
              key={foto.id}
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === actual}
              sx={{
                width: 64,
                height: 64,
                border: i === actual ? "2px solid" : "1px solid",
                borderColor: i === actual ? "primary.main" : "text.primary",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box component="img" src={urlFoto(foto)} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </ButtonBase>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductGallery;
