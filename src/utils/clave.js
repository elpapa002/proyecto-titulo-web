import bcrypt from "bcryptjs";
import { limpiarRut } from "./rut";

const CAMPOS_CLAVE = ["clave", "clave2", "claveActual", "claveNueva"];

// para los console.log, asi no se ven las claves
export const ocultarClaves = (datos) => {
  const copia = { ...datos };
  CAMPOS_CLAVE.forEach((campo) => {
    if (copia[campo]) copia[campo] = "********";
  });
  return copia;
};

// la sal sale del RUN, asi el mismo usuario siempre genera el mismo cifrado
// y el backend lo puede comparar. Formato de bcrypt: $2b$10$ + 22 caracteres
export const salDelRun = (run) => {
  const base = `CompraVenta${limpiarRut(run).toUpperCase()}`.padEnd(21, ".").slice(0, 21);
  return `$2b$10$${base}.`;
};

// la clave sale del navegador ya cifrada con bcrypt, nunca en texto plano.
// El backend la vuelve a cifrar con bcrypt antes de guardarla
export const cifrarClave = (run, clave) => bcrypt.hash(clave, salDelRun(run));
