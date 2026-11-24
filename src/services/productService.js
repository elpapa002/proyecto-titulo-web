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

// la oferta baja el precio de cada variante en el mismo porcentaje que el del producto (igual que el backend)
const precioConOferta = (producto, precio, oferta) =>
  precio === producto.precio ? oferta.precioOferta : Math.round((precio * oferta.precioOferta) / producto.precio);

const completar = (producto) => {
  const oferta = ofertaActiva(producto.id);
  const variantes = (producto.variantes ?? []).map((v) => ({
    ...v,
    precioOferta: oferta ? precioConOferta(producto, v.precio, oferta) : null,
  }));
  return {
    ...producto,
    stock: variantes.length ? variantes.reduce((suma, v) => suma + v.stock, 0) : producto.stock,
    variantes,
    relacionados: producto.relacionados ?? [],
    textoAlternativo: producto.textoAlternativo ?? "",
    fotos: memoria.fotos.filter((f) => f.productoId === producto.id).map((f, orden) => ({ id: f.id, orden, url: f.url })),
    tienda: nombreTiendaDe(producto.vendedorId),
    precioOferta: oferta?.precioOferta ?? null,
    finOferta: oferta?.fin ?? null,
  };
};

// en modo prueba las variantes nuevas reciben un id como lo haria la base
const conIdsDeVariante = (variantes = []) => {
  let siguiente = siguienteId(memoria.productos.flatMap((p) => p.variantes ?? []));
  return variantes.map((v) => (v.id ? v : { ...v, id: siguiente++ }));
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

// primero los que eligio el emprendedor y despues se completa con la misma subcategoria o tienda
export const obtenerRelacionados = (producto) =>
  llamarApi(`/productos/${producto.id}/relacionados`, "GET", null, () => {
    const elegidos = (producto.relacionados ?? [])
      .map((id) => memoria.productos.find((p) => p.id === id && p.estado === "Publicada"))
      .filter(Boolean);
    const resto = memoria.productos
      .filter((p) => p.id !== producto.id && p.estado === "Publicada" && !elegidos.includes(p))
      .filter((p) => p.subcategoriaId === producto.subcategoriaId || p.vendedorId === producto.vendedorId);
    return [...elegidos, ...resto].slice(0, 5).map(completar);
  });

export const crearProducto = (datos) =>
  llamarApi("/productos", "POST", datos, () => {
    const nuevo = { ...datos, variantes: conIdsDeVariante(datos.variantes), id: siguienteId(memoria.productos), calificacion: 0, resenas: 0 };
    memoria.productos = [nuevo, ...memoria.productos];
    return completar(nuevo);
  });

export const actualizarProducto = (id, datos) =>
  llamarApi(`/productos/${id}`, "PUT", datos, () => {
    memoria.productos = memoria.productos.map((p) =>
      p.id === id ? { ...p, ...datos, variantes: conIdsDeVariante(datos.variantes ?? p.variantes) } : p
    );
    return completar(memoria.productos.find((p) => p.id === id));
  });

// la foto viaja como data URL ("data:image/png;base64,...") y el backend la guarda en la base
export const subirFoto = (productoId, foto) =>
  llamarApi(`/productos/${productoId}/fotos`, "POST", { tipo: foto.tipo, datos: foto.datos.split(",")[1] }, () => {
    if (memoria.fotos.filter((f) => f.productoId === productoId).length >= 4)
      throw new Error("Cada publicación puede tener como máximo 4 fotos.");
    const nueva = { id: siguienteId(memoria.fotos), productoId, url: foto.datos };
    memoria.fotos = [...memoria.fotos, nueva];
    return { id: nueva.id, url: nueva.url };
  });

export const eliminarFoto = (id) =>
  llamarApi(`/fotos/${id}`, "DELETE", null, () => {
    memoria.fotos = memoria.fotos.filter((f) => f.id !== id);
    return { id };
  });

export const eliminarProducto = (id) =>
  llamarApi(`/productos/${id}`, "DELETE", null, () => {
    memoria.productos = memoria.productos.filter((p) => p.id !== id);
    memoria.ofertas = memoria.ofertas.filter((o) => o.productoId !== id);
    return { id };
  });
