import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { normalizar } from "../utils/formato";

const armarArbol = () =>
  memoria.categorias
    .filter((c) => c.padreId === null)
    .map((c) => ({ ...c, subcategorias: memoria.categorias.filter((s) => s.padreId === c.id) }));

const crearRuta = (nombre) =>
  normalizar(nombre)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const obtenerCategorias = () => llamarApi("/categorias", "GET", null, armarArbol);

export const crearCategoria = (datos) =>
  llamarApi("/categorias", "POST", datos, () => {
    const nueva = { ...datos, id: siguienteId(memoria.categorias), ruta: crearRuta(datos.nombre) };
    memoria.categorias = [...memoria.categorias, nueva];
    return nueva;
  });

export const actualizarCategoria = (id, datos) =>
  llamarApi(`/categorias/${id}`, "PUT", datos, () => {
    memoria.categorias = memoria.categorias.map((c) =>
      c.id === id ? { ...c, ...datos, ruta: crearRuta(datos.nombre) } : c
    );
    return memoria.categorias.find((c) => c.id === id);
  });

export const eliminarCategoria = (id) =>
  llamarApi(`/categorias/${id}`, "DELETE", null, () => {
    if (memoria.categorias.some((c) => c.padreId === id)) throw new Error("La categoría tiene subcategorías.");
    if (memoria.productos.some((p) => p.categoriaId === id || p.subcategoriaId === id))
      throw new Error("Hay publicaciones en esta categoría.");
    memoria.categorias = memoria.categorias.filter((c) => c.id !== id);
    return { id };
  });
