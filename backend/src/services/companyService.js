import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

export const obtenerCompanias = () => llamarApi("/companias", "GET", null, () => [...memoria.companias]);

export const crearCompania = (datos) =>
  llamarApi("/companias", "POST", datos, () => {
    const nueva = { ...datos, id: siguienteId(memoria.companias) };
    memoria.companias = [nueva, ...memoria.companias];
    return nueva;
  });

export const actualizarCompania = (id, datos) =>
  llamarApi(`/companias/${id}`, "PUT", datos, () => {
    memoria.companias = memoria.companias.map((c) => (c.id === id ? { ...c, ...datos } : c));
    return memoria.companias.find((c) => c.id === id);
  });

export const eliminarCompania = (id) =>
  llamarApi(`/companias/${id}`, "DELETE", null, () => {
    memoria.companias = memoria.companias.filter((c) => c.id !== id);
    memoria.usuarios = memoria.usuarios.map((u) => (u.companiaId === id ? { ...u, companiaId: null } : u));
    return { id };
  });
