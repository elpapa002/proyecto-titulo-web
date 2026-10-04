import { useId } from "react";
import { Box, TextField, Typography } from "@mui/material";

const FormField = ({ label, id, sx, slotProps, ...props }) => {
  const idAutomatico = useId();
  const campoId = id ?? idAutomatico;
  const etiquetaId = `${campoId}-etiqueta`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, width: "100%", ...sx }}>
      {label && (
        <Typography
          component="label"
          id={etiquetaId}
          htmlFor={campoId}
          sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}
        >
          {label}
        </Typography>
      )}
      <TextField
        id={campoId}
        fullWidth
        size="small"
        {...props}
        slotProps={{
          ...slotProps,
          select: { labelId: label ? etiquetaId : undefined, ...slotProps?.select },
          formHelperText: { sx: { mx: 0, fontSize: 12 } },
        }}
      />
    </Box>
  );
};

export default FormField;
