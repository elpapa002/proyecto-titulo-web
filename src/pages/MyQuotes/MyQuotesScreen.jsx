import { useEffect, useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import QuoteCard from "../../components/organisms/QuoteCard/QuoteCard";
import QuoteDecisionDialog from "../../components/organisms/QuoteDecisionDialog/QuoteDecisionDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import InfoHint from "../../components/molecules/InfoHint/InfoHint";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import {
  DIAS_VIGENCIA,
  cambiarEstadoCotizacion,
  eliminarCotizacion,
  obtenerMisCotizaciones,
} from "../../services/cotizacionService";
import { formatearPrecio } from "../../utils/formato";

const filtros = [
  { valor: "todas", texto: "Todas" },
  { valor: "Pendiente", texto: "Pendientes" },
  { valor: "Respondida", texto: "Respondidas" },
  { valor: "Aceptada", texto: "Aceptadas" },
  { valor: "Rechazada", texto: "Rechazadas" },
  { valor: "Vencida", texto: "Vencidas" },
];

const MyQuotesScreen = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [filtro, setFiltro] = useState("todas");
  const [decision, setDecision] = useState(null);
  const [aCancelar, setACancelar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerMisCotizaciones(usuario.id);
      if (respuesta.ok) setCotizaciones([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id));
      else setAviso("No se pudieron cargar tus cotizaciones.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const cumple = (valor) => (c) => valor === "todas" || c.estado === valor;
  const visibles = cotizaciones.filter(cumple(filtro));

  const confirmarDecision = async () => {
    const { cotizacion, estado } = decision;
    console.log(estado === "Aceptada" ? "Cotización aceptada:" : "Cotización rechazada:", {
      id: cotizacion.id,
      tienda: cotizacion.tienda,
      total: cotizacion.respuesta.total,
    });
    const respuesta = await cambiarEstadoCotizacion(cotizacion.id, estado);
    setDecision(null);
    if (!respuesta.ok) {
      setAviso("No se pudo actualizar la cotización. Intenta de nuevo.");
      return;
    }
    setAviso(estado === "Aceptada" ? "Cotización aceptada" : "Cotización rechazada");
    setRecargas((n) => n + 1);
  };

  const confirmarCancelacion = async () => {
    const cotizacion = aCancelar;
    console.log("Cotización cancelada:", { id: cotizacion.id, tienda: cotizacion.tienda });
    const respuesta = await eliminarCotizacion(cotizacion.id);
    setACancelar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo cancelar la cotización. Intenta de nuevo.");
      return;
    }
    setAviso("Cotización cancelada");
    setRecargas((n) => n + 1);
  };

  let vacio = "No tienes cotizaciones en este estado.";
  if (cargando) vacio = "Cargando cotizaciones...";
  else if (cotizaciones.length === 0) vacio = "Todavía no pides cotizaciones. Puedes pedir una desde el detalle de un producto.";

  const aceptando = decision?.estado === "Aceptada";

  return (
    <>
      <PageHeader titulo="Mis cotizaciones" subtitulo="Revisa el estado de tus cotizaciones y hasta cuándo están vigentes." />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {filtros.map((f) => (
          <Chip
            key={f.valor}
            label={`${f.texto} (${cotizaciones.filter(cumple(f.valor)).length})`}
            color="primary"
            variant={filtro === f.valor ? "filled" : "outlined"}
            onClick={() => setFiltro(f.valor)}
            sx={{ ...(filtro !== f.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <InfoHint
        texto={`Los valores que te da el emprendedor se respetan durante ${DIAS_VIGENCIA} días desde su respuesta. Después la cotización queda vencida y tienes que pedir una nueva.`}
        sx={{ mb: 2 }}
      />

      <Stack spacing={2}>
        {visibles.length === 0 && <Typography sx={{ py: 3, textAlign: "center" }}>{vacio}</Typography>}
        {visibles.map((c) => (
          <QuoteCard
            key={c.id}
            cotizacion={c}
            diasVigencia={DIAS_VIGENCIA}
            onAceptar={(cotizacion) => setDecision({ cotizacion, estado: "Aceptada" })}
            onRechazar={(cotizacion) => setDecision({ cotizacion, estado: "Rechazada" })}
            onCancelar={setACancelar}
            onMensaje={(cotizacion) => navigate("/tienda/mensajes", { state: { vendedorId: cotizacion.vendedorId } })}
          />
        ))}
      </Stack>

      <QuoteDecisionDialog
        open={Boolean(decision)}
        titulo={aceptando ? "¿Aceptar la cotización?" : "¿Rechazar la cotización?"}
        mensaje={
          decision
            ? aceptando
              ? `Vas a aceptar la cotización N° ${decision.cotizacion.id} de ${decision.cotizacion.tienda} por ${formatearPrecio(decision.cotizacion.respuesta.total)}. El emprendedor recibirá un aviso para coordinar la compra.`
              : `Vas a rechazar la cotización N° ${decision.cotizacion.id} de ${decision.cotizacion.tienda}. Esta acción no se puede deshacer.`
            : ""
        }
        textoConfirmar={aceptando ? "Aceptar cotización" : "Rechazar cotización"}
        icono={aceptando ? <CheckIcon /> : <CloseIcon />}
        onCancelar={() => setDecision(null)}
        onConfirmar={confirmarDecision}
      />

      <DeleteDialog
        open={Boolean(aCancelar)}
        titulo="¿Cancelar la cotización?"
        mensaje={
          aCancelar
            ? `Se eliminará tu solicitud de cotización N° ${aCancelar.id} a ${aCancelar.tienda}. Esta acción no se puede deshacer.`
            : ""
        }
        onCancelar={() => setACancelar(null)}
        onConfirmar={confirmarCancelacion}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default MyQuotesScreen;
