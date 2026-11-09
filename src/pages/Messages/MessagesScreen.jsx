import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ConversationList from "../../components/organisms/ConversationList/ConversationList";
import ChatWindow from "../../components/organisms/ChatWindow/ChatWindow";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { enviarMensaje, nombreParaChat, obtenerConversaciones, obtenerMensajes } from "../../services/mensajeService";

const claveDe = (conversacion) => (conversacion ? `${conversacion.clienteId}-${conversacion.vendedorId}` : "");

const MessagesScreen = () => {
  const { usuario } = useUser();
  const { enTienda, esMovil } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const comoVendedor = !enTienda;
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajes, setMensajes] = useState({ clave: "", lista: [] });
  const [recargas, setRecargas] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState("");
  const [seleccion, setSeleccion] = useState(() => {
    const vendedorId = location.state?.vendedorId;
    const clienteId = location.state?.clienteId;
    if (!comoVendedor && vendedorId && vendedorId !== usuario.id) return { clienteId: usuario.id, vendedorId };
    if (comoVendedor && clienteId) return { clienteId, vendedorId: usuario.id };
    return null;
  });

  useEffect(() => {
    if (location.state?.vendedorId || location.state?.clienteId) navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerConversaciones(usuario.id, comoVendedor);
      if (respuesta.ok) setConversaciones(respuesta.datos);
      else setAviso("No se pudieron cargar tus conversaciones.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, comoVendedor, recargas]);

  const sinMensajes =
    !cargando && seleccion && !conversaciones.some((c) => claveDe(c) === claveDe(seleccion))
      ? {
          ...seleccion,
          nombre: nombreParaChat(seleccion.clienteId, seleccion.vendedorId, comoVendedor),
          ultimo: "",
          fecha: "",
        }
      : null;
  const lista = sinMensajes ? [sinMensajes, ...conversaciones] : conversaciones;
  const activa = seleccion
    ? (lista.find((c) => claveDe(c) === claveDe(seleccion)) ?? null)
    : esMovil
      ? null
      : (lista[0] ?? null);
  const claveActiva = claveDe(activa);
  const clienteActivo = activa?.clienteId ?? null;
  const vendedorActivo = activa?.vendedorId ?? null;

  useEffect(() => {
    if (!clienteActivo || !vendedorActivo) return;
    const cargar = async () => {
      const respuesta = await obtenerMensajes(clienteActivo, vendedorActivo);
      if (respuesta.ok) setMensajes({ clave: `${clienteActivo}-${vendedorActivo}`, lista: respuesta.datos });
    };
    cargar();
  }, [clienteActivo, vendedorActivo, recargas]);

  const enviar = async (texto) => {
    const datos = { clienteId: activa.clienteId, vendedorId: activa.vendedorId, autorId: usuario.id, texto };
    console.log("Datos para enviar mensaje:", datos);
    const respuesta = await enviarMensaje(datos);
    if (!respuesta.ok) {
      setAviso("No se pudo enviar el mensaje. Intenta de nuevo.");
      return false;
    }
    setAviso("Mensaje enviado");
    setRecargas((n) => n + 1);
    return true;
  };

  const verChat = !esMovil || Boolean(seleccion);
  const verLista = !esMovil || !seleccion;

  return (
    <>
      <PageHeader
        titulo="Mensajes"
        subtitulo={`${
          comoVendedor
            ? "Conversa con tus clientes antes y después de la venta."
            : "Conversa con los emprendedores antes y después de la compra."
        } Los campos marcados con * son obligatorios.`}
      />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: "text.primary",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          height: { md: 560 },
        }}
      >
        {verLista && (
          <Box sx={{ minHeight: 0, borderRight: { md: "1px solid" }, borderColor: { md: "text.primary" } }}>
            <ConversationList
              conversaciones={lista}
              claveActiva={claveActiva}
              cargando={cargando}
              comoVendedor={comoVendedor}
              busqueda={busqueda}
              onBuscar={setBusqueda}
              onElegir={(c) => setSeleccion({ clienteId: c.clienteId, vendedorId: c.vendedorId })}
            />
          </Box>
        )}
        {verChat && (
          <Box sx={{ minHeight: 0, minWidth: 0 }}>
            <ChatWindow
              key={claveActiva}
              conversacion={activa}
              mensajes={mensajes.clave === claveActiva ? mensajes.lista : null}
              usuarioId={usuario.id}
              comoVendedor={comoVendedor}
              esMovil={esMovil}
              onVolver={() => setSeleccion(null)}
              onEnviar={enviar}
            />
          </Box>
        )}
      </Paper>

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default MessagesScreen;
