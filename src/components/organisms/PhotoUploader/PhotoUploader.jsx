import { Box, Button, IconButton, Typography } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseIcon from "@mui/icons-material/Close";

export const MAX_FOTOS = 4;
const DOS_MB = 2 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

const leerArchivo = (archivo) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });

// fotos: [{ id?, url, nueva? }]. Las nuevas se suben al guardar la publicacion
const PhotoUploader = ({ fotos, error, onCambiar, onError }) => {
  const elegir = async (e) => {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = "";
    if (archivos.length === 0) return;
    if (archivos.some((a) => !TIPOS.includes(a.type))) return onError("Las fotos deben ser JPG, PNG o WEBP.");
    if (archivos.some((a) => a.size > DOS_MB)) return onError("Cada foto puede pesar hasta 2 MB.");
    if (fotos.length + archivos.length > MAX_FOTOS) onError(`Solo se guardan las primeras ${MAX_FOTOS} fotos.`);
    else onError("");
    const nuevas = await Promise.all(
      archivos.map(async (archivo) => {
        const datos = await leerArchivo(archivo);
        return { url: datos, nueva: { tipo: archivo.type, datos, nombre: archivo.name } };
      })
    );
    onCambiar([...fotos, ...nuevas].slice(0, MAX_FOTOS));
  };

  return (
    <>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        startIcon={<FileUploadOutlinedIcon />}
        sx={{ borderStyle: "dashed", py: 2 }}
        disabled={fotos.length >= MAX_FOTOS}
      >
        Subir fotos (máximo {MAX_FOTOS})
        <Box component="input" hidden type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={elegir} />
      </Button>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: error ? 600 : 400 }} role={error ? "alert" : undefined}>
        {error || "JPG, PNG o WEBP de hasta 2 MB cada una. La primera es la principal."}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, my: 2 }}>
        {Array.from({ length: MAX_FOTOS }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "relative",
              aspectRatio: "1",
              border: i === 0 && fotos[0] ? "2px solid" : "1px solid",
              borderColor: i === 0 && fotos[0] ? "primary.main" : "text.primary",
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            {fotos[i] ? (
              <>
                <Box component="img" src={fotos[i].url} alt={`Foto ${i + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <IconButton
                  size="small"
                  onClick={() => onCambiar(fotos.filter((_, j) => j !== i))}
                  aria-label={`Quitar la foto ${i + 1}`}
                  sx={{ position: "absolute", top: 2, right: 2, bgcolor: "secondary.main", p: 0.25, "&:hover": { bgcolor: "secondary.main" } }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </>
            ) : (
              <ImageOutlinedIcon fontSize="small" />
            )}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default PhotoUploader;
