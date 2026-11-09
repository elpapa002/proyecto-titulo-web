import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

export const obtenerCostosEnvio = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/envios`, "GET", null, () =>
    memoria.costosEnvio.filter((c) => c.vendedorId === vendedorId)
  );

export const calcularEnvio = (vendedorId, comuna) =>
  llamarApi(`/vendedores/${vendedorId}/envios/${comuna}`, "GET", null, () => {
    const costo = memoria.costosEnvio.find((c) => c.vendedorId === vendedorId && c.comuna === comuna);
    if (!costo) throw new Error(`Este emprendedor no despacha a ${comuna}.`);
    return costo;
  });

const revisarRepetida = (datos, id) => {
  const repetida = memoria.costosEnvio.some(
    (c) => c.id !== id && c.vendedorId === datos.vendedorId && c.comuna === datos.comuna
  );
  if (repetida) throw new Error("Ya tienes un costo para esa comuna.");
};

export const crearCostoEnvio = (datos) =>
  llamarApi("/envios", "POST", datos, () => {
    revisarRepetida(datos);
    const nuevo = { ...datos, id: siguienteId(memoria.costosEnvio) };
    memoria.costosEnvio = [...memoria.costosEnvio, nuevo];
    return nuevo;
  });

export const actualizarCostoEnvio = (id, datos) =>
  llamarApi(`/envios/${id}`, "PUT", datos, () => {
    revisarRepetida(datos, id);
    memoria.costosEnvio = memoria.costosEnvio.map((c) => (c.id === id ? { ...c, ...datos } : c));
    return memoria.costosEnvio.find((c) => c.id === id);
  });

export const eliminarCostoEnvio = (id) =>
  llamarApi(`/envios/${id}`, "DELETE", null, () => {
    memoria.costosEnvio = memoria.costosEnvio.filter((c) => c.id !== id);
    return { id };
  });
