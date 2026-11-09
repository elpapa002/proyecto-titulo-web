import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { hoyIso } from "../utils/formato";

export const nombreTiendaDe = (vendedorId) => {
  const vendedor = memoria.usuarios.find((u) => u.id === vendedorId);
  if (!vendedor) return "Emprendedor";
  const compania = memoria.companias.find((c) => c.id === vendedor.companiaId);
  return compania?.nombre ?? `${vendedor.nombres.split(" ")[0]} ${vendedor.apellidos.split(" ")[0]}`;
};

export const ofertaActiva = (productoId) => {
  const hoy = hoyIso();
  return memoria.ofertas.find((o) => o.productoId === productoId && o.inicio <= hoy && o.fin >= hoy) ?? null;
};

const completar = (producto) => {
  const oferta = ofertaActiva(producto.id);
  return {
    ...producto,
    tienda: nombreTiendaDe(producto.vendedorId),
    precioOferta: oferta?.precioOferta ?? null,
    finOferta: oferta?.fin ?? null,
  };
};

export const obtenerProductos = () =>
  llamarApi("/productos", "GET", null, () =>
    memoria.productos.filter((p) => p.estado === "Publicada").map(completar)
  );

export const obtenerMisProductos = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/productos`, "GET", null, () =>
    memoria.productos.filter((p) => p.vendedorId === vendedorId).map(completar)
  );

export const obtenerProducto = (id) =>
  llamarApi(`/productos/${id}`, "GET", null, () => {
    const producto = memoria.productos.find((p) => p.id === id);
    if (!producto) throw new Error("No existe la publicación.");
    return completar(producto);
  });

export const obtenerRelacionados = (producto) =>
  llamarApi(`/productos/${producto.id}/relacionados`, "GET", null, () =>
    memoria.productos
      .filter((p) => p.id !== producto.id && p.estado === "Publicada")
      .filter((p) => p.subcategoriaId === producto.subcategoriaId || p.vendedorId === producto.vendedorId)
      .slice(0, 5)
      .map(completar)
  );

export const crearProducto = (datos) =>
  llamarApi("/productos", "POST", datos, () => {
    const nuevo = { ...datos, id: siguienteId(memoria.productos), calificacion: 0, resenas: 0 };
    memoria.productos = [nuevo, ...memoria.productos];
    return nuevo;
  });

export const actualizarProducto = (id, datos) =>
  llamarApi(`/productos/${id}`, "PUT", datos, () => {
    memoria.productos = memoria.productos.map((p) => (p.id === id ? { ...p, ...datos } : p));
    return memoria.productos.find((p) => p.id === id);
  });

export const eliminarProducto = (id) =>
  llamarApi(`/productos/${id}`, "DELETE", null, () => {
    memoria.productos = memoria.productos.filter((p) => p.id !== id);
    memoria.ofertas = memoria.ofertas.filter((o) => o.productoId !== id);
    return { id };
  });
