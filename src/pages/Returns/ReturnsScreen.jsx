import { useEffect, useState } from "react";
import { Box, Chip, Divider, Link, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ReturnReviewDialog from "../../components/organisms/ReturnReviewDialog/ReturnReviewDialog";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerDevolucionesRecibidas, resolverDevolucion } from "../../services/devolucionService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";

const ESTADOS = ["Pendiente", "Aprobada", "Rechazada"];
const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const Dato = ({ etiqueta, children }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
    <Typography sx={{ flexShrink: 0 }}>{etiqueta}</Typography>
    <Typography component="div" sx={{ textAlign: "right" }}>
      {children}
    </Typography>
  </Box>
);

const ReturnsScreen = () => {
  const { usuario } = useUser();
  const [devoluciones, setDevoluciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [filtro, setFiltro] = useState("Todas");
  const [aEvaluar, setAEvaluar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerDevolucionesRecibidas(usuario.id);
      if (respuesta.ok) setDevoluciones([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha)));
      else setAviso("No se pudieron cargar las devoluciones.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const guardarDecision = async (datos) => {
    const respuesta = await resolverDevolucion(aEvaluar.id, datos);
    if (!respuesta.ok) {
      setAviso("No se pudo guardar la decisión. Intenta de nuevo.");
      return;
    }
    setAviso(datos.estado === "Aprobada" ? "Devolución aprobada" : "Devolución rechazada");
    setAEvaluar(null);
    setRecargas((n) => n + 1);
  };

  const chips = ["Todas", ...ESTADOS].map((estado) => ({
    valor: estado,
    cantidad: estado === "Todas" ? devoluciones.length : devoluciones.filter((d) => d.estado === estado).length,
  }));
  const visibles = devoluciones.filter((d) => filtro === "Todas" || d.estado === filtro);

  return (
    <>
      <PageHeader titulo="Devoluciones" subtitulo="Aprueba o rechaza las solicitudes de devolución de tus clientes." />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
        {chips.map((chip) => (
          <Chip
            key={chip.valor}
            label={`${chip.valor} (${chip.cantidad})`}
            color="primary"
            variant={filtro === chip.valor ? "filled" : "outlined"}
            onClick={() => setFiltro(chip.valor)}
            sx={{ ...(filtro !== chip.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <Stack spacing={2}>
        {visibles.length === 0 && (
          <Paper variant="outlined" sx={tarjeta}>
            <Typography>{cargando ? "Cargando devoluciones..." : "No hay devoluciones con este estado."}</Typography>
          </Paper>
        )}

        {visibles.map((devolucion) => (
          <Paper key={devolucion.id} variant="outlined" sx={{ ...tarjeta, maxWidth: 760 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="h3">Devolución N° {devolucion.id}</Typography>
                <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
                  {devolucion.nombreProducto} × {devolucion.cantidad} {devolucion.cantidad === 1 ? "unidad" : "unidades"}
                </Typography>
              </Box>
              <StatusChip texto={devolucion.estado} relleno={devolucion.estado === "Pendiente"} />
            </Box>

            <Divider sx={{ my: 1.5 }} />
            <Dato etiqueta="Compra">
              <Link
                component={RouterLink}
                to={`/mi-tienda/ventas/${devolucion.ventaId}`}
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Pedido N° {devolucion.ventaId}
              </Link>
            </Dato>
            <Dato etiqueta="Cliente">{devolucion.cliente}</Dato>
            <Dato etiqueta="Solicitada el">{formatearFecha(devolucion.fecha)}</Dato>
            <Dato etiqueta="Motivo">{devolucion.motivo}</Dato>
            <Dato etiqueta="Detalle">"{devolucion.detalle}"</Dato>
            <Dato etiqueta="Monto">
              <Box component="span" sx={{ fontWeight: 700 }}>
                {formatearPrecio(devolucion.monto)}
              </Box>
            </Dato>

            {devolucion.estado === "Pendiente" ? (
              <CustomButton startIcon={<FactCheckOutlinedIcon />} onClick={() => setAEvaluar(devolucion)} sx={{ mt: 2 }}>
                Evaluar
              </CustomButton>
            ) : (
              devolucion.respuesta && (
                <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.25, mt: 2 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Tu respuesta</Typography>
                  <Typography>"{devolucion.respuesta}"</Typography>
                </Box>
              )
            )}
          </Paper>
        ))}
      </Stack>

      {aEvaluar && (
        <ReturnReviewDialog devolucion={aEvaluar} onCerrar={() => setAEvaluar(null)} onGuardar={guardarDecision} />
      )}

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default ReturnsScreen;
