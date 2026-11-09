import { Box, Checkbox, Typography } from "@mui/material";

const RoleOption = ({ titulo, detalle, marcado, onChange }) => {
  return (
    <Box
      component="label"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: marcado ? "11px" : "12px",
        border: marcado ? "2px solid" : "1px solid",
        borderColor: marcado ? "primary.main" : "text.primary",
        borderRadius: 1,
        cursor: "pointer",
      }}
    >
      <Checkbox checked={marcado} onChange={onChange} size="small" sx={{ p: 0.5 }} />
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{titulo}</Typography>
        <Typography variant="body2">{detalle}</Typography>
      </Box>
    </Box>
  );
};

export default RoleOption;
