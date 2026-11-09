import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

const nombreTienda = (vendedorId) => {
  const vendedor = memoria.usuarios.find((u) => u.id === vendedorId);
  if (!vendedor) return "Emprendedor";
  const compania = memoria.companias.find((c) => c.id === vendedor.companiaId);
  return compania?.nombre ?? `${vendedor.nombres.split(" ")[0]} ${vendedor.apellidos.split(" ")[0]}`;
};

const conTienda = (producto) => ({ ...producto, tienda: nombreTienda(producto.vendedorId) });

export const obtenerProductos = () =>
  llamarApi("/productos", "GET", null, () =>
    memoria.productos.filter((p) => p.estado === "Publicada").map(conTienda)
  );

export const obtenerMisProductos = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/productos`, "GET", null, () =>
    memoria.productos.filter((p) => p.vendedorId === vendedorId).map(conTienda)
  );

export const obtenerProducto = (id) =>
  llamarApi(`/productos/${id}`, "GET", null, () => {
    const producto = memoria.productos.find((p) => p.id === id);
    return producto ? conTienda(producto) : null;
  });

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
    return { id };
  });

export const obtenerMisPedidos = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/pedidos`, "GET", null, () =>
    memoria.pedidos.filter((p) => p.vendedorId === vendedorId).sort((a, b) => b.id - a.id)
  );
