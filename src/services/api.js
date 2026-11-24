import { borrarSesion, leerSesion } from "../utils/sesion";

// si no hay .env se usan los datos de prueba
const USAR_BACKEND = import.meta.env.VITE_USAR_BACKEND === "true";
const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export const AVISO_SESION = "aviso-login";
const SESION_VENCIDA = "Tu sesión venció. Vuelve a iniciar sesión.";

// el token vencio o el backend ya no lo reconoce: se borra la sesion y se vuelve al login
const volverAlLogin = () => {
  borrarSesion();
  try {
    sessionStorage.setItem(AVISO_SESION, SESION_VENCIDA);
  } catch {
    // si no se puede guardar el aviso igual se vuelve al login
  }
  window.location.assign("/login");
};

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

    // el backend manda esta cabecera cuando el token no sirve (no pasa con una clave mal escrita)
    if (respuesta.status === 401 && respuesta.headers.get("WWW-Authenticate")) {
      volverAlLogin();
      return { ok: false, error: SESION_VENCIDA };
    }

    // si alguna respuesta viene sin cuerpo (204) no hay json que leer
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

// direccion de una foto: en modo prueba la foto ya viene como data URL, con backend se pide a /api/fotos/{id}
export const urlFoto = (foto) => foto?.url ?? `${URL_API}/fotos/${foto.id}`;
