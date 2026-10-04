import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { hoyIso } from "../utils/formato";

export const obtenerUsuarios = () => llamarApi("/usuarios", "GET", null, () => [...memoria.usuarios]);

export const crearUsuario = (datos) =>
  llamarApi("/usuarios", "POST", datos, () => {
    const nuevo = { ...datos, id: siguienteId(memoria.usuarios), fechaIngreso: hoyIso(), fechaNacimiento: "" };
    memoria.usuarios = [nuevo, ...memoria.usuarios];
    return nuevo;
  });

export const actualizarUsuario = (id, datos) =>
  llamarApi(`/usuarios/${id}`, "PUT", datos, () => {
    memoria.usuarios = memoria.usuarios.map((u) => (u.id === id ? { ...u, ...datos } : u));
    return memoria.usuarios.find((u) => u.id === id);
  });

export const eliminarUsuario = (id) =>
  llamarApi(`/usuarios/${id}`, "DELETE", null, () => {
    memoria.usuarios = memoria.usuarios.filter((u) => u.id !== id);
    return { id };
  });

export const actualizarPerfil = (id, datos) => actualizarUsuario(id, datos);

export const cambiarClave = (id, datos) => llamarApi(`/usuarios/${id}/clave`, "PUT", datos, () => ({ id }));
