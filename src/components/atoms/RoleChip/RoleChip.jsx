import { Chip } from "@mui/material";

const RoleChip = ({ rol }) => {
  const relleno = rol === "Vendedor";
  return (
    <Chip
      label={rol}
      size="small"
      color="primary"
      variant={relleno ? "filled" : "outlined"}
      sx={{ fontSize: 12, height: 24, ...(!relleno && { color: "text.primary", borderColor: "text.primary" }) }}
    />
  );
};

export default RoleChip;
