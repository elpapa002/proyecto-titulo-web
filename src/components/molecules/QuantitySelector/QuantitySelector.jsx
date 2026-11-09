import { Box, IconButton, InputBase } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const estiloBoton = { color: "text.primary", "&.Mui-disabled": { color: "text.primary", opacity: 0.35 } };

const QuantitySelector = ({ valor, minimo = 1, maximo, onChange, disabled = false, etiqueta = "Cantidad" }) => {
  const limitar = (numero) => Math.min(Math.max(numero, minimo), Math.max(maximo, minimo));

  const escribir = (e) => {
    const digitos = e.target.value.replace(/\D/g, "");
    onChange(limitar(digitos ? Number(digitos) : minimo));
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "text.primary",
        borderRadius: 1,
        height: 40,
        bgcolor: "secondary.main",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <IconButton
        size="small"
        onClick={() => onChange(limitar(valor - 1))}
        disabled={disabled || valor <= minimo}
        aria-label={`Restar uno a ${etiqueta.toLowerCase()}`}
        sx={estiloBoton}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <InputBase
        value={valor}
        onChange={escribir}
        disabled={disabled}
        slotProps={{
          input: {
            inputMode: "numeric",
            "aria-label": etiqueta,
            style: { textAlign: "center", fontWeight: 600, width: 36, padding: 0 },
          },
        }}
      />
      <IconButton
        size="small"
        onClick={() => onChange(limitar(valor + 1))}
        disabled={disabled || valor >= maximo}
        aria-label={`Sumar uno a ${etiqueta.toLowerCase()}`}
        sx={estiloBoton}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default QuantitySelector;
