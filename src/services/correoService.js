import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

// correos adicionales (el principal es el del usuario)
export const obtenerCorreos = (usuarioId) =>
  llamarApi(`/usuarios/${usuarioId}/correos`, "GET", null, () =>
    memoria.correosAdicionales.filter((c) => c.usuarioId === usuarioId)
  );

const revisarCorreo = (correo, id) => {
  const buscado = correo.trim().toLowerCase();
  const ocupado =
    memoria.usuarios.some((u) => u.correo === buscado) ||
    memoria.correosAdicionales.some((c) => c.id !== id && c.correo === buscado);
  if (ocupado) throw new Error("Ese correo ya pertenece a una persona registrada.");
};

export const crearCorreo = (datos) =>
  llamarApi("/correos", "POST", datos, () => {
    revisarCorreo(datos.correo);
    const nuevo = { ...datos, correo: datos.correo.trim().toLowerCase(), id: siguienteId(memoria.correosAdicionales) };
    memoria.correosAdicionales = [...memoria.correosAdicionales, nuevo];
    return nuevo;
  });

export const eliminarCorreo = (id) =>
  llamarApi(`/correos/${id}`, "DELETE", null, () => {
    memoria.correosAdicionales = memoria.correosAdicionales.filter((c) => c.id !== id);
    return { id };
  });
