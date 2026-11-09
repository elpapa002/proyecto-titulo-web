import { useId } from "react";
import { Box, TextField, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

const FormField = ({ label, id, sx, slotProps, required, error, helperText, ...props }) => {
  const idAutomatico = useId();
  const campoId = id ?? idAutomatico;
  const etiquetaId = `${campoId}-etiqueta`;

  const ayuda =
    error && helperText ? (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
        <ErrorOutlineIcon sx={{ fontSize: 16 }} />
        {helperText}
      </Box>
    ) : (
      helperText
    );

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
          {required && <Box component="span" aria-hidden="true"> *</Box>}
        </Typography>
      )}
      <TextField
        id={campoId}
        fullWidth
        size="small"
        required={required}
        error={error}
        helperText={ayuda}
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
