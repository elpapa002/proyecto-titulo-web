import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FormField from "../FormField/FormField";

const SearchBar = ({ label = "Buscar", placeholder, value, onChange }) => {
  return (
    <FormField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchBar;
