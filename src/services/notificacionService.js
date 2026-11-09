import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { hoyIso } from "../utils/formato";

export const agregarNotificacion = (usuarioId, texto, ruta) => {
  const nueva = { id: siguienteId(memoria.notificaciones), usuarioId, texto, fecha: hoyIso(), leida: false, ruta };
  memoria.notificaciones = [nueva, ...memoria.notificaciones];
  return nueva;
};

export const obtenerNotificaciones = (usuarioId) =>
  llamarApi(`/usuarios/${usuarioId}/notificaciones`, "GET", null, () =>
    memoria.notificaciones.filter((n) => n.usuarioId === usuarioId)
  );

export const marcarLeida = (id) =>
  llamarApi(`/notificaciones/${id}`, "PUT", { leida: true }, () => {
    memoria.notificaciones = memoria.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n));
    return { id };
  });

export const marcarTodasLeidas = (usuarioId) =>
  llamarApi(`/usuarios/${usuarioId}/notificaciones`, "PUT", { leida: true }, () => {
    memoria.notificaciones = memoria.notificaciones.map((n) => (n.usuarioId === usuarioId ? { ...n, leida: true } : n));
    return { usuarioId };
  });

export const eliminarNotificacion = (id) =>
  llamarApi(`/notificaciones/${id}`, "DELETE", null, () => {
    memoria.notificaciones = memoria.notificaciones.filter((n) => n.id !== id);
    return { id };
  });
