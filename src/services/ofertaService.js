import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { formatearPrecio } from "../utils/formato";

const completar = (oferta) => {
  const producto = memoria.productos.find((p) => p.id === oferta.productoId);
  return { ...oferta, nombreProducto: producto?.nombre ?? "", precio: producto?.precio ?? 0 };
};

const difundir = (oferta) => {
  const producto = memoria.productos.find((p) => p.id === oferta.productoId);
  memoria.usuarios
    .filter((u) => u.roles.includes("Cliente") && u.id !== oferta.vendedorId)
    .forEach((u) =>
      agregarNotificacion(u.id, `Nueva oferta: ${producto.nombre} a ${formatearPrecio(oferta.precioOferta)}.`, `/tienda/producto/${producto.id}`)
    );
};

const revisarCruce = (datos, id) => {
  const cruzada = memoria.ofertas.some(
    (o) => o.id !== id && o.productoId === datos.productoId && o.inicio <= datos.fin && o.fin >= datos.inicio
  );
  if (cruzada) throw new Error("Ese producto ya tiene una oferta en esas fechas.");
};

export const obtenerMisOfertas = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/ofertas`, "GET", null, () =>
    memoria.ofertas.filter((o) => o.vendedorId === vendedorId).map(completar)
  );

export const crearOferta = (datos) =>
  llamarApi("/ofertas", "POST", datos, () => {
    revisarCruce(datos);
    const nueva = { ...datos, id: siguienteId(memoria.ofertas) };
    memoria.ofertas = [nueva, ...memoria.ofertas];
    if (nueva.difundir) difundir(nueva);
    return completar(nueva);
  });

export const actualizarOferta = (id, datos) =>
  llamarApi(`/ofertas/${id}`, "PUT", datos, () => {
    revisarCruce(datos, id);
    memoria.ofertas = memoria.ofertas.map((o) => (o.id === id ? { ...o, ...datos } : o));
    return completar(memoria.ofertas.find((o) => o.id === id));
  });

export const eliminarOferta = (id) =>
  llamarApi(`/ofertas/${id}`, "DELETE", null, () => {
    memoria.ofertas = memoria.ofertas.filter((o) => o.id !== id);
    return { id };
  });
