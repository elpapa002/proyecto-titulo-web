import { leerSesion } from "../utils/sesion";

const USAR_BACKEND = false;
const URL_API = "http://localhost:3000/api";

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export const llamarApi = async (ruta, metodo, datos, simular) => {
  try {
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

    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con el código ${respuesta.status}`);
    }

    return { ok: true, datos: await respuesta.json() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const siguienteId = (lista) => Math.max(0, ...lista.map((item) => item.id)) + 1;
