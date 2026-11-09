import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { nombreTiendaDe } from "./productService";
import { hoyIso } from "../utils/formato";

const completar = (devolucion) => {
  const cliente = memoria.usuarios.find((u) => u.id === devolucion.clienteId);
  return {
    ...devolucion,
    cliente: cliente ? `${cliente.nombres.split(" ")[0]} ${cliente.apellidos.split(" ")[0]}` : "Cliente",
    tienda: nombreTiendaDe(devolucion.vendedorId),
  };
};

export const obtenerMisDevoluciones = (clienteId) =>
  llamarApi(`/clientes/${clienteId}/devoluciones`, "GET", null, () =>
    memoria.devoluciones.filter((d) => d.clienteId === clienteId).map(completar)
  );

export const obtenerDevolucionesRecibidas = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/devoluciones`, "GET", null, () =>
    memoria.devoluciones.filter((d) => d.vendedorId === vendedorId).map(completar)
  );

export const crearDevolucion = (datos) =>
  llamarApi("/devoluciones", "POST", datos, () => {
    const repetida = memoria.devoluciones.some(
      (d) => d.ventaId === datos.ventaId && d.productoId === datos.productoId && d.estado !== "Rechazada"
    );
    if (repetida) throw new Error("Ya pediste la devolución de este producto.");
    const nueva = { ...datos, id: siguienteId(memoria.devoluciones), fecha: hoyIso(), estado: "Pendiente", respuesta: "" };
    memoria.devoluciones = [nueva, ...memoria.devoluciones];
    agregarNotificacion(nueva.vendedorId, `${completar(nueva).cliente} pidió la devolución de una compra.`, "/mi-tienda/devoluciones");
    return completar(nueva);
  });

export const resolverDevolucion = (id, datos) =>
  llamarApi(`/devoluciones/${id}`, "PUT", datos, () => {
    const devolucion = memoria.devoluciones.find((d) => d.id === id);
    if (datos.estado === "Aprobada" && datos.reponerStock) {
      memoria.productos = memoria.productos.map((p) =>
        p.id === devolucion.productoId ? { ...p, stock: p.stock + devolucion.cantidad } : p
      );
    }
    memoria.devoluciones = memoria.devoluciones.map((d) =>
      d.id === id ? { ...d, estado: datos.estado, respuesta: datos.respuesta } : d
    );
    agregarNotificacion(
      devolucion.clienteId,
      `Tu devolución de ${devolucion.nombreProducto} fue ${datos.estado.toLowerCase()}.`,
      `/tienda/compras/${devolucion.ventaId}`
    );
    return completar(memoria.devoluciones.find((d) => d.id === id));
  });
