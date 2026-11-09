import { useEffect, useState } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import NotificationItem from "../../components/molecules/NotificationItem/NotificationItem";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import {
  eliminarNotificacion,
  marcarLeida,
  marcarTodasLeidas,
  obtenerNotificaciones,
} from "../../services/notificacionService";

const NotificationsScreen = () => {
  const { usuario } = useUser();
  const { recargarAvisos } = useOutletContext();
  const navigate = useNavigate();
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [filtro, setFiltro] = useState("todas");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerNotificaciones(usuario.id);
      if (respuesta.ok) setAvisos([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id));
      else setAviso("No se pudieron cargar tus avisos.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const actualizar = () => {
    setRecargas((n) => n + 1);
    recargarAvisos?.();
  };

  const sinLeer = avisos.filter((a) => !a.leida).length;
  const visibles = filtro === "noLeidas" ? avisos.filter((a) => !a.leida) : avisos;
  const filtros = [
    { valor: "todas", texto: `Todas (${avisos.length})` },
    { valor: "noLeidas", texto: `No leídas (${sinLeer})` },
  ];

  const abrir = async (notificacion) => {
    if (!notificacion.leida) {
      console.log("Aviso marcado como leído:", { id: notificacion.id, ruta: notificacion.ruta });
      await marcarLeida(notificacion.id);
      recargarAvisos?.();
    }
    if (notificacion.ruta) navigate(notificacion.ruta);
    else setRecargas((n) => n + 1);
  };

  const marcarTodas = async () => {
    console.log("Avisos marcados como leídos:", { usuarioId: usuario.id, cantidad: sinLeer });
    const respuesta = await marcarTodasLeidas(usuario.id);
    if (!respuesta.ok) {
      setAviso("No se pudieron marcar los avisos. Intenta de nuevo.");
      return;
    }
    setAviso("Todos tus avisos quedaron como leídos");
    actualizar();
  };

  const eliminar = async (notificacion) => {
    console.log("Aviso eliminado:", { id: notificacion.id, texto: notificacion.texto });
    const respuesta = await eliminarNotificacion(notificacion.id);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar el aviso. Intenta de nuevo.");
      return;
    }
    setAviso("Aviso eliminado");
    actualizar();
  };

  let vacio = "No tienes avisos.";
  if (cargando) vacio = "Cargando avisos...";
  else if (filtro === "noLeidas") vacio = "No tienes avisos sin leer.";

  return (
    <>
      <PageHeader
        titulo="Notificaciones"
        subtitulo="Avisos sobre tus pedidos, cotizaciones, devoluciones y mensajes. Toca un aviso para ir al detalle."
        acciones={
          <CustomButton tono="contorno" startIcon={<DoneAllIcon />} onClick={marcarTodas} disabled={sinLeer === 0}>
            Marcar todas como leídas
          </CustomButton>
        }
      />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {filtros.map((f) => (
          <Chip
            key={f.valor}
            label={f.texto}
            color="primary"
            variant={filtro === f.valor ? "filled" : "outlined"}
            onClick={() => setFiltro(f.valor)}
            sx={{ ...(filtro !== f.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
        {visibles.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: "center" }}>{vacio}</Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {visibles.map((a) => (
              <NotificationItem key={a.id} aviso={a} onAbrir={abrir} onEliminar={eliminar} />
            ))}
          </Box>
        )}
      </Paper>

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default NotificationsScreen;
