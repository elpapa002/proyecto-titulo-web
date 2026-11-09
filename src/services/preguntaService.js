import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { hoyIso } from "../utils/formato";

const completar = (pregunta) => {
  const cliente = memoria.usuarios.find((u) => u.id === pregunta.clienteId);
  const producto = memoria.productos.find((p) => p.id === pregunta.productoId);
  return {
    ...pregunta,
    cliente: cliente ? cliente.nombres.split(" ")[0] : "Cliente",
    nombreProducto: producto?.nombre ?? "",
  };
};

export const obtenerPreguntasProducto = (productoId) =>
  llamarApi(`/productos/${productoId}/preguntas`, "GET", null, () =>
    memoria.preguntas.filter((p) => p.productoId === productoId).map(completar)
  );

export const obtenerPreguntasRecibidas = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/preguntas`, "GET", null, () => {
    const mios = memoria.productos.filter((p) => p.vendedorId === vendedorId).map((p) => p.id);
    return memoria.preguntas.filter((p) => mios.includes(p.productoId)).map(completar);
  });

export const crearPregunta = (datos) =>
  llamarApi(`/productos/${datos.productoId}/preguntas`, "POST", datos, () => {
    const nueva = { ...datos, id: siguienteId(memoria.preguntas), fecha: hoyIso(), respuesta: "", fechaRespuesta: "" };
    memoria.preguntas = [nueva, ...memoria.preguntas];
    const producto = memoria.productos.find((p) => p.id === datos.productoId);
    agregarNotificacion(producto.vendedorId, `Tienes una pregunta nueva en ${producto.nombre}.`, "/mi-tienda/preguntas");
    return completar(nueva);
  });

export const responderPregunta = (id, respuesta) =>
  llamarApi(`/preguntas/${id}`, "PUT", { respuesta }, () => {
    memoria.preguntas = memoria.preguntas.map((p) => (p.id === id ? { ...p, respuesta, fechaRespuesta: hoyIso() } : p));
    const pregunta = memoria.preguntas.find((p) => p.id === id);
    agregarNotificacion(pregunta.clienteId, "El vendedor respondió tu pregunta.", `/tienda/producto/${pregunta.productoId}`);
    return completar(pregunta);
  });

export const eliminarPregunta = (id) =>
  llamarApi(`/preguntas/${id}`, "DELETE", null, () => {
    memoria.preguntas = memoria.preguntas.filter((p) => p.id !== id);
    return { id };
  });
