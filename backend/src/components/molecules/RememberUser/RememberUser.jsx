import { Checkbox, FormControlLabel } from "@mui/material";

const RememberUser = ({ checked, onChange }) => {
  return (
    <FormControlLabel
      label="Recordar mi sesión"
      sx={{ m: 0, gap: 0.5, "& .MuiFormControlLabel-label": { fontSize: 14, color: "secondary.main" } }}
      control={
        <Checkbox
          name="recordar"
          checked={checked}
          onChange={onChange}
          size="small"
          sx={{ p: 0.5, color: "secondary.main", "&.Mui-checked": { color: "secondary.main" } }}
        />
      }
    />
  );
};

export default RememberUser;
