import { llamarApi } from "./api";
import { categorias } from "./datosPrueba";

export const obtenerCategorias = () => llamarApi("/categorias", "GET", null, () => categorias);
