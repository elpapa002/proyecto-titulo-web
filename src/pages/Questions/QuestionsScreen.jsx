import { useEffect, useState } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import QuestionCard from "../../components/organisms/QuestionCard/QuestionCard";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { eliminarPregunta, obtenerPreguntasRecibidas, responderPregunta } from "../../services/preguntaService";

const filtros = [
  { valor: "pendientes", texto: "Sin responder", cumple: (p) => !p.respuesta },
  { valor: "respondidas", texto: "Respondidas", cumple: (p) => Boolean(p.respuesta) },
  { valor: "todas", texto: "Todas", cumple: () => true },
];

const QuestionsScreen = () => {
  const { usuario } = useUser();
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [filtro, setFiltro] = useState("pendientes");
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerPreguntasRecibidas(usuario.id);
      if (respuesta.ok) setPreguntas([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha)));
      else setAviso("No se pudieron cargar las preguntas.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const responder = async (pregunta, texto) => {
    const respuesta = await responderPregunta(pregunta.id, texto);
    if (!respuesta.ok) {
      setAviso("No se pudo publicar la respuesta. Intenta de nuevo.");
      return;
    }
    setAviso("Respuesta publicada");
    setRecargas((n) => n + 1);
  };

  const confirmarBorrado = async () => {
    const pregunta = aBorrar;
    console.log("Pregunta eliminada:", { id: pregunta.id, productoId: pregunta.productoId, cliente: pregunta.cliente });
    const respuesta = await eliminarPregunta(pregunta.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    setAviso("Pregunta eliminada");
    setRecargas((n) => n + 1);
  };

  const filtroActual = filtros.find((f) => f.valor === filtro);
  const visibles = preguntas.filter(filtroActual.cumple);

  return (
    <>
      <PageHeader
        titulo="Preguntas recibidas"
        subtitulo="Responde las preguntas que hacen los clientes en tus publicaciones. Los campos marcados con * son obligatorios."
      />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {filtros.map((f) => (
          <Chip
            key={f.valor}
            label={`${f.texto} (${preguntas.filter(f.cumple).length})`}
            color="primary"
            variant={filtro === f.valor ? "filled" : "outlined"}
            onClick={() => setFiltro(f.valor)}
            sx={{ ...(filtro !== f.valor && { color: "text.primary", borderColor: "text.primary" }) }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          border: "1px solid",
          borderColor: "text.primary",
          borderRadius: 1,
          p: 1.25,
          mb: 2.5,
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
        <Typography>
          Tus respuestas se publican en la ficha del producto para que todos los clientes las vean. El cliente recibe
          un aviso cuando respondes.
        </Typography>
      </Box>

      <Stack spacing={2}>
        {visibles.length === 0 && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
            <Typography>
              {cargando
                ? "Cargando preguntas..."
                : filtro === "pendientes"
                  ? "No tienes preguntas sin responder."
                  : "No hay preguntas en esta lista."}
            </Typography>
          </Paper>
        )}
        {visibles.map((pregunta) => (
          <QuestionCard key={pregunta.id} pregunta={pregunta} onResponder={responder} onEliminar={setABorrar} />
        ))}
      </Stack>

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar pregunta?"
        mensaje={
          aBorrar
            ? `Vas a eliminar la pregunta de ${aBorrar.cliente} en "${aBorrar.nombreProducto}". Esta acción no se puede deshacer.`
            : ""
        }
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default QuestionsScreen;
