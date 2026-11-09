import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

export const obtenerDirecciones = (usuarioId) =>
  llamarApi(`/usuarios/${usuarioId}/direcciones`, "GET", null, () =>
    memoria.direcciones.filter((d) => d.usuarioId === usuarioId)
  );

const dejarUnaPrincipal = (usuarioId, principalId) => {
  memoria.direcciones = memoria.direcciones.map((d) =>
    d.usuarioId === usuarioId ? { ...d, principal: d.id === principalId } : d
  );
};

export const crearDireccion = (datos) =>
  llamarApi("/direcciones", "POST", datos, () => {
    const primera = !memoria.direcciones.some((d) => d.usuarioId === datos.usuarioId);
    const nueva = { ...datos, id: siguienteId(memoria.direcciones), principal: primera || datos.principal };
    memoria.direcciones = [...memoria.direcciones, nueva];
    if (nueva.principal) dejarUnaPrincipal(nueva.usuarioId, nueva.id);
    return nueva;
  });

export const actualizarDireccion = (id, datos) =>
  llamarApi(`/direcciones/${id}`, "PUT", datos, () => {
    memoria.direcciones = memoria.direcciones.map((d) => (d.id === id ? { ...d, ...datos } : d));
    const direccion = memoria.direcciones.find((d) => d.id === id);
    if (direccion.principal) dejarUnaPrincipal(direccion.usuarioId, id);
    return direccion;
  });

export const eliminarDireccion = (id) =>
  llamarApi(`/direcciones/${id}`, "DELETE", null, () => {
    const direccion = memoria.direcciones.find((d) => d.id === id);
    const propias = memoria.direcciones.filter((d) => d.usuarioId === direccion.usuarioId);
    if (propias.length === 1) throw new Error("Debes tener al menos una dirección de despacho.");
    memoria.direcciones = memoria.direcciones.filter((d) => d.id !== id);
    if (direccion.principal) {
      const otra = memoria.direcciones.find((d) => d.usuarioId === direccion.usuarioId);
      dejarUnaPrincipal(direccion.usuarioId, otra.id);
    }
    return { id };
  });

export const obtenerTelefonos = (usuarioId) =>
  llamarApi(`/usuarios/${usuarioId}/telefonos`, "GET", null, () =>
    memoria.telefonos.filter((t) => t.usuarioId === usuarioId)
  );

const revisarTelefono = (numero, id) => {
  const limpio = numero.replace(/\D/g, "");
  if (memoria.telefonos.some((t) => t.id !== id && t.numero.replace(/\D/g, "") === limpio))
    throw new Error("Ese teléfono ya pertenece a otra persona.");
};

export const crearTelefono = (datos) =>
  llamarApi("/telefonos", "POST", datos, () => {
    revisarTelefono(datos.numero);
    const nuevo = { ...datos, id: siguienteId(memoria.telefonos) };
    memoria.telefonos = [...memoria.telefonos, nuevo];
    return nuevo;
  });

export const actualizarTelefono = (id, datos) =>
  llamarApi(`/telefonos/${id}`, "PUT", datos, () => {
    revisarTelefono(datos.numero, id);
    memoria.telefonos = memoria.telefonos.map((t) => (t.id === id ? { ...t, ...datos } : t));
    return memoria.telefonos.find((t) => t.id === id);
  });

export const eliminarTelefono = (id) =>
  llamarApi(`/telefonos/${id}`, "DELETE", null, () => {
    memoria.telefonos = memoria.telefonos.filter((t) => t.id !== id);
    return { id };
  });
