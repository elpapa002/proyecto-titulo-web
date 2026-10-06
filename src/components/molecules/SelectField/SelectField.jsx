import { MenuItem } from "@mui/material";
import FormField from "../FormField/FormField";
import LoginField from "../LoginField/LoginField";

const SelectField = ({ opciones, oscuro = false, ...props }) => {
  const Campo = oscuro ? LoginField : FormField;

  return (
    <Campo select {...props}>
      {opciones.map((opcion) => (
        <MenuItem key={opcion.valor} value={opcion.valor}>
          {opcion.texto}
        </MenuItem>
      ))}
    </Campo>
  );
};

export default SelectField;
