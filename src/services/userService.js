import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { hoyIso } from "../utils/formato";
import { cifrarClave } from "../utils/clave";
import { limpiarRut } from "../utils/rut";

export const obtenerUsuarios = () => llamarApi("/usuarios", "GET", null, () => [...memoria.usuarios]);

// en modo prueba se arma una clave temporal parecida a la del backend
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const claveTemporalDePrueba = () => {
  const texto = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => LETRAS[b % LETRAS.length]).join("");
  return `${texto.slice(0, 4)}-${texto.slice(4)}`;
};

export const crearUsuario = (datos) =>
  llamarApi("/usuarios", "POST", datos, () => {
    const nuevo = { ...datos, id: siguienteId(memoria.usuarios), fechaIngreso: hoyIso(), fechaNacimiento: "" };
    memoria.usuarios = [nuevo, ...memoria.usuarios];
    return { ...nuevo, claveTemporal: claveTemporalDePrueba() };
  });

export const actualizarUsuario = (id, datos) =>
  llamarApi(`/usuarios/${id}`, "PUT", datos, () => {
    memoria.usuarios = memoria.usuarios.map((u) => (u.id === id ? { ...u, ...datos } : u));
    return memoria.usuarios.find((u) => u.id === id);
  });

export const eliminarUsuario = (id) =>
  llamarApi(`/usuarios/${id}`, "DELETE", null, () => {
    memoria.usuarios = memoria.usuarios.filter((u) => u.id !== id);
    return { id };
  });

export const actualizarPerfil = (id, datos) => actualizarUsuario(id, datos);

export const restablecerClave = (id) =>
  llamarApi(`/usuarios/${id}/clave/restablecer`, "PUT", null, () => ({ id, claveTemporal: claveTemporalDePrueba() }));

export const cambiarClave = async (id, datos) => {
  const claves = {
    claveActual: await cifrarClave(datos.run, datos.claveActual),
    claveNueva: await cifrarClave(datos.run, datos.claveNueva),
  };
  return llamarApi(`/usuarios/${id}/clave`, "PUT", { ...datos, ...claves }, () => ({ id }));
};

// para el registro y el perfil: avisa si el RUN, los correos o el RUT de la empresa ya estan usados
export const revisarDisponibilidad = (datos) =>
  llamarApi("/usuarios/disponibilidad", "POST", datos, () => {
    const correos = (datos.correos ?? []).map((c) => c.trim().toLowerCase());
    return {
      runOcupado: Boolean(datos.run) && memoria.usuarios.some((u) => limpiarRut(u.run) === limpiarRut(datos.run)),
      correosOcupados: memoria.usuarios.map((u) => u.correo.toLowerCase()).filter((c) => correos.includes(c)),
      rutEmpresaOcupado:
        Boolean(datos.rutEmpresa) && memoria.companias.some((c) => limpiarRut(c.rut) === limpiarRut(datos.rutEmpresa)),
    };
  });
