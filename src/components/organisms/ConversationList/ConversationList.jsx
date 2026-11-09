import { Box, ButtonBase, Typography } from "@mui/material";
import ChatAvatar from "../../atoms/ChatAvatar/ChatAvatar";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { formatearFecha, hoyIso, normalizar } from "../../../utils/formato";

const fechaCorta = (fecha) => {
  if (!fecha) return "";
  if (fecha.startsWith(hoyIso())) return fecha.slice(11);
  return formatearFecha(fecha.slice(0, 10)).slice(0, 5);
};

const ConversationList = ({ conversaciones, claveActiva, cargando, comoVendedor, busqueda, onBuscar, onElegir }) => {
  const visibles = conversaciones.filter((c) => normalizar(c.nombre).includes(normalizar(busqueda.trim())));

  let vacio = "No hay conversaciones con ese nombre.";
  if (cargando) vacio = "Cargando conversaciones...";
  else if (conversaciones.length === 0)
    vacio = comoVendedor
      ? "Todavía no tienes mensajes de clientes."
      : "Todavía no tienes conversaciones. Puedes escribirle a un emprendedor desde el detalle de una compra.";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "text.primary" }}>
        <SearchBar
          label="Buscar conversación"
          placeholder={comoVendedor ? "Nombre del cliente" : "Nombre de la tienda"}
          value={busqueda}
          onChange={onBuscar}
        />
      </Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, overflowY: "auto", flexGrow: 1 }}>
        {visibles.length === 0 && (
          <Box component="li" sx={{ p: 2 }}>
            <Typography>{vacio}</Typography>
          </Box>
        )}
        {visibles.map((c) => {
          const clave = `${c.clienteId}-${c.vendedorId}`;
          const activa = clave === claveActiva;
          return (
            <Box component="li" key={clave} sx={{ borderBottom: "1px solid", borderColor: "text.primary" }}>
              <ButtonBase
                onClick={() => onElegir(c)}
                aria-current={activa ? "true" : undefined}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderLeft: "3px solid",
                  borderLeftColor: activa ? "primary.main" : "transparent",
                }}
              >
                <ChatAvatar nombre={c.nombre} />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography noWrap sx={{ fontWeight: activa ? 700 : 600 }}>
                      {c.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ flexShrink: 0 }}>
                      {fechaCorta(c.fecha)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" noWrap>
                    {c.ultimo || "Sin mensajes todavía"}
                  </Typography>
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ConversationList;
