import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { nombreTiendaDe } from "./productService";

const ahora = () => {
  const fecha = new Date();
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
};

const nombreCliente = (clienteId) => {
  const cliente = memoria.usuarios.find((u) => u.id === clienteId);
  return cliente ? `${cliente.nombres.split(" ")[0]} ${cliente.apellidos.split(" ")[0]}` : "Cliente";
};

export const obtenerConversaciones = (usuarioId, comoVendedor) =>
  llamarApi(`/usuarios/${usuarioId}/conversaciones`, "GET", null, () => {
    const mios = memoria.mensajes.filter((m) => (comoVendedor ? m.vendedorId : m.clienteId) === usuarioId);
    const claves = [...new Set(mios.map((m) => `${m.clienteId}-${m.vendedorId}`))];
    return claves.map((clave) => {
      const [clienteId, vendedorId] = clave.split("-").map(Number);
      const lista = mios.filter((m) => m.clienteId === clienteId && m.vendedorId === vendedorId);
      const ultimo = lista[lista.length - 1];
      return {
        clienteId,
        vendedorId,
        nombre: comoVendedor ? nombreCliente(clienteId) : nombreTiendaDe(vendedorId),
        ultimo: ultimo.texto,
        fecha: ultimo.fecha,
      };
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

export const obtenerMensajes = (clienteId, vendedorId) =>
  llamarApi(`/conversaciones/${clienteId}/${vendedorId}`, "GET", null, () =>
    memoria.mensajes.filter((m) => m.clienteId === clienteId && m.vendedorId === vendedorId)
  );

export const enviarMensaje = (datos) =>
  llamarApi("/mensajes", "POST", datos, () => {
    const nuevo = { ...datos, id: siguienteId(memoria.mensajes), fecha: ahora() };
    memoria.mensajes = [...memoria.mensajes, nuevo];
    return nuevo;
  });

export const nombreParaChat = (clienteId, vendedorId, comoVendedor) =>
  comoVendedor ? nombreCliente(clienteId) : nombreTiendaDe(vendedorId);
