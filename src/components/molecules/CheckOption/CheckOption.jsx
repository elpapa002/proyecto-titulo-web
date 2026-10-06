import { Checkbox, FormControlLabel } from "@mui/material";

const CheckOption = ({ label, checked, onChange, oscuro = false, name }) => {
  const color = oscuro ? "secondary.main" : "primary.main";

  return (
    <FormControlLabel
      label={label}
      sx={{ m: 0, gap: 0.5, "& .MuiFormControlLabel-label": { fontSize: 14, color: oscuro ? "secondary.main" : "text.primary" } }}
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          size="small"
          sx={{ p: 0.5, color, "&.Mui-checked": { color } }}
        />
      }
    />
  );
};

export default CheckOption;
