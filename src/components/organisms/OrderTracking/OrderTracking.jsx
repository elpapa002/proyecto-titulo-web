import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import StatusChip from "../../atoms/StatusChip/StatusChip";

const PASOS = ["Pagado", "En preparación", "Enviado", "Entregado"];

const OrderTracking = ({ estado }) => {
  if (estado === "Cancelado") {
    return (
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        <StatusChip texto="Cancelado" relleno />
        <Typography>Este pedido fue cancelado, por eso no tiene seguimiento de envío.</Typography>
      </Box>
    );
  }

  const actual = PASOS.indexOf(estado);

  return (
    <Box
      component="ol"
      aria-label="Seguimiento del pedido"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 1.5, sm: 1.5 },
      }}
    >
      {PASOS.map((paso, i) => {
        const completo = i < actual || (i === actual && estado === "Entregado");
        const alcanzado = i <= actual;
        const esActual = i === actual;
        return (
          <Box
            component="li"
            key={paso}
            aria-current={esActual ? "step" : undefined}
            sx={{ display: "flex", alignItems: "center", gap: 1, flex: { sm: i < PASOS.length - 1 ? 1 : "none" } }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 600,
                border: "1.5px solid",
                borderColor: "primary.main",
                bgcolor: alcanzado ? "primary.main" : "secondary.main",
                color: alcanzado ? "secondary.main" : "primary.main",
              }}
            >
              {completo ? <CheckIcon sx={{ fontSize: 16 }} /> : i + 1}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: esActual ? 600 : 400, whiteSpace: "nowrap" }}>{paso}</Typography>
              {esActual && <Typography variant="body2">Estado actual</Typography>}
            </Box>
            {i < PASOS.length - 1 && (
              <Box
                aria-hidden="true"
                sx={{
                  display: { xs: "none", sm: "block" },
                  flexGrow: 1,
                  minWidth: 16,
                  borderTopWidth: "2px",
                  borderTopStyle: i < actual ? "solid" : "dashed",
                  borderColor: "primary.main",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default OrderTracking;
