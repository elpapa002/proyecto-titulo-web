import { Button } from "@mui/material";

const tonos = {
  primario: { variant: "contained", color: "primary" },
  claro: { variant: "contained", color: "secondary" },
  contorno: { variant: "outlined", color: "primary" },
};

const CustomButton = ({ tono = "primario", children, sx, ...props }) => {
  return (
    <Button
      {...tonos[tono]}
      sx={{
        borderRadius: 1,
        ...(tono === "contorno" && { borderColor: "primary.main", bgcolor: "secondary.main" }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
