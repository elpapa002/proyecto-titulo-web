import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { hoyIso } from "../utils/formato";

const completar = (calificacion) => {
  const cliente = memoria.usuarios.find((u) => u.id === calificacion.clienteId);
  return { ...calificacion, cliente: cliente ? cliente.nombres.split(" ")[0] : "Cliente" };
};

export const obtenerCalificacionesProducto = (productoId) =>
  llamarApi(`/productos/${productoId}/calificaciones`, "GET", null, () =>
    memoria.calificaciones.filter((c) => c.productoId === productoId).map(completar)
  );

export const crearCalificacion = (datos) =>
  llamarApi("/calificaciones", "POST", datos, () => {
    const nueva = { ...datos, id: siguienteId(memoria.calificaciones), fecha: hoyIso() };
    memoria.calificaciones = [nueva, ...memoria.calificaciones];
    memoria.productos = memoria.productos.map((p) => {
      if (p.id !== datos.productoId) return p;
      const resenas = p.resenas + 1;
      const calificacion = Math.round(((p.calificacion * p.resenas + datos.notaProducto) / resenas) * 10) / 10;
      return { ...p, resenas, calificacion };
    });
    memoria.ventas = memoria.ventas.map((v) => (v.id === datos.ventaId ? { ...v, calificada: true } : v));
    return completar(nueva);
  });
