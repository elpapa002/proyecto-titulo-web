import { useState } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import FormField from "../FormField/FormField";
import LoginField from "../LoginField/LoginField";

const PasswordField = ({ oscuro = false, ...props }) => {
  const [visible, setVisible] = useState(false);
  const Campo = oscuro ? LoginField : FormField;

  return (
    <Campo
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Ocultar clave" : "Mostrar clave"}
              >
                {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
