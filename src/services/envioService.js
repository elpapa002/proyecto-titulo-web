import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";

export const obtenerCostosEnvio = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/envios`, "GET", null, () =>
    memoria.costosEnvio.filter((c) => c.vendedorId === vendedorId)
  );

// kilos es el peso total del carro; solo cambia el costo si el emprendedor cobra segun el peso
export const calcularEnvio = (vendedorId, comuna, kilos = 0) =>
  llamarApi(`/vendedores/${vendedorId}/envios/${comuna}?peso=${Math.round(kilos * 100) / 100}`, "GET", null, () => {
    const propios = memoria.costosEnvio.filter((c) => c.vendedorId === vendedorId);
    const fila = propios.find((c) => c.comuna === comuna) ?? propios.find((c) => c.comuna === RESTO_REGION);
    if (!fila) throw new Error(`Este emprendedor no despacha a ${comuna}.`);
    const config = memoria.configuracionesEnvio.find((c) => c.vendedorId === vendedorId);
    const adicionales = Math.max(0, Math.ceil(kilos) - 1);
    const porPeso = config?.forma === "Peso";
    return {
      comuna,
      zona: fila.comuna,
      forma: porPeso ? "Peso" : "Comuna",
      peso: kilos,
      costo: porPeso ? config.costoBase + adicionales * config.costoKilo : fila.costo,
      dias: fila.dias,
    };
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

export const RESTO_REGION = "Resto de la región";

const CONFIGURACION_INICIAL = { forma: "Comuna", costoBase: 0, costoKilo: 0, tamanoMaximo: "", retiroLocal: false, direccionRetiro: "" };

export const obtenerConfiguracionEnvio = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/envios/configuracion`, "GET", null, () => ({
    vendedorId,
    ...CONFIGURACION_INICIAL,
    ...memoria.configuracionesEnvio.find((c) => c.vendedorId === vendedorId),
  }));

export const guardarConfiguracionEnvio = (vendedorId, datos) =>
  llamarApi(`/vendedores/${vendedorId}/envios/configuracion`, "PUT", datos, () => {
    const nueva = { ...datos, vendedorId };
    memoria.configuracionesEnvio = [...memoria.configuracionesEnvio.filter((c) => c.vendedorId !== vendedorId), nueva];
    return nueva;
  });

// "450 g", "1,2 kg" -> kilos (igual que el backend)
export const enKilos = (peso) => {
  const texto = (peso ?? "").toLowerCase();
  const numero = texto.match(/\d+([.,]\d+)?/);
  if (!numero) return 0;
  const valor = Number(numero[0].replace(",", "."));
  return /\d\s*(g|gr|grs|gramos?)\b/.test(texto) ? valor / 1000 : valor;
};
