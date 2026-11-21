import { Box, Chip } from "@mui/material";
import FormField from "../FormField/FormField";
import { PERIODOS } from "../../../utils/periodo";
import { hoyIso } from "../../../utils/formato";

const PeriodFilter = ({ desde, hasta, periodo, errores, onElegirPeriodo, onCambiarFecha }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}>
      <FormField
        label="Desde"
        name="desde"
        type="date"
        value={desde}
        onChange={onCambiarFecha}
        error={Boolean(errores.desde)}
        helperText={errores.desde}
        slotProps={{ htmlInput: { max: hasta || hoyIso() } }}
        sx={{ width: 190 }}
      />
      <FormField
        label="Hasta"
        name="hasta"
        type="date"
        value={hasta}
        onChange={onCambiarFecha}
        error={Boolean(errores.hasta)}
        helperText={errores.hasta}
        slotProps={{ htmlInput: { min: desde, max: hoyIso() } }}
        sx={{ width: 190 }}
      />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: { xs: 0, sm: 3.75 } }}>
        {PERIODOS.map((p) => (
          <Chip
            key={p.valor}
            label={p.texto}
            clickable
            color="primary"
            variant={periodo === p.valor ? "filled" : "outlined"}
            onClick={() => onElegirPeriodo(p.valor)}
            aria-pressed={periodo === p.valor}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PeriodFilter;
