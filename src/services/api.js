import { leerSesion } from "../utils/sesion";

// si no hay .env se usan los datos de prueba
const USAR_BACKEND = import.meta.env.VITE_USAR_BACKEND === "true";
const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export const llamarApi = async (ruta, metodo, datos, simular) => {
  try {
    // modo sin backend: se simula la respuesta
    if (!USAR_BACKEND) {
      await esperar(300);
      return { ok: true, datos: simular() };
    }

    const token = leerSesion()?.token;
    const respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: datos ? JSON.stringify(datos) : undefined,
    });

    // el DELETE devuelve 204 y no trae json
    if (respuesta.status === 204) return { ok: true, datos: null };

    const resultado = await respuesta.json();
    // fetch no tira error con 400 o 500, hay que revisarlo a mano
    if (!respuesta.ok || !resultado.success) {
      const detalle = resultado.errors?.length ? ` ${resultado.errors.join(" ")}` : "";
      throw new Error(`${resultado.message ?? `El servidor respondió con el código ${respuesta.status}.`}${detalle}`);
    }

    return { ok: true, datos: resultado.data };
  } catch (error) {
    return { ok: false, error: error.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : error.message };
  }
};

export const siguienteId = (lista) => Math.max(0, ...lista.map((item) => item.id)) + 1;
