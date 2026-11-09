import { Chip } from "@mui/material";

const StatusChip = ({ texto, relleno = false }) => {
  return (
    <Chip
      label={texto}
      size="small"
      color="primary"
      variant={relleno ? "filled" : "outlined"}
      sx={{
        fontSize: 12,
        height: 24,
        whiteSpace: "nowrap",
        ...(!relleno && { color: "text.primary", borderColor: "text.primary" }),
      }}
    />
  );
};

export default StatusChip;
