import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { nombreTiendaDe } from "./productService";
import { hoyIso } from "../utils/formato";

export const DIAS_VIGENCIA = 15;

const estadoActual = (cotizacion) =>
  cotizacion.estado === "Respondida" && cotizacion.respuesta.vigencia < hoyIso() ? "Vencida" : cotizacion.estado;

const completar = (cotizacion) => {
  const cliente = memoria.usuarios.find((u) => u.id === cotizacion.clienteId);
  return {
    ...cotizacion,
    estado: estadoActual(cotizacion),
    cliente: cliente ? `${cliente.nombres.split(" ")[0]} ${cliente.apellidos.split(" ")[0]}` : "Cliente",
    tienda: nombreTiendaDe(cotizacion.vendedorId),
  };
};

const sumarDias = (fechaIso, dias) => {
  const fecha = new Date(`${fechaIso}T12:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

export const obtenerMisCotizaciones = (clienteId) =>
  llamarApi(`/clientes/${clienteId}/cotizaciones`, "GET", null, () =>
    memoria.cotizaciones.filter((c) => c.clienteId === clienteId).map(completar)
  );

export const obtenerCotizacionesRecibidas = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/cotizaciones`, "GET", null, () =>
    memoria.cotizaciones.filter((c) => c.vendedorId === vendedorId).map(completar)
  );

export const crearCotizacion = (datos) =>
  llamarApi("/cotizaciones", "POST", datos, () => {
    const nueva = { ...datos, id: siguienteId(memoria.cotizaciones), fecha: hoyIso(), estado: "Pendiente", respuesta: null };
    memoria.cotizaciones = [nueva, ...memoria.cotizaciones];
    const cliente = completar(nueva).cliente;
    agregarNotificacion(nueva.vendedorId, `${cliente} te pidió una cotización.`, "/mi-tienda/cotizaciones");
    return completar(nueva);
  });

export const responderCotizacion = (id, datos) =>
  llamarApi(`/cotizaciones/${id}/respuesta`, "PUT", datos, () => {
    const respuesta = { ...datos, fecha: hoyIso(), vigencia: sumarDias(hoyIso(), DIAS_VIGENCIA) };
    memoria.cotizaciones = memoria.cotizaciones.map((c) => (c.id === id ? { ...c, estado: "Respondida", respuesta } : c));
    const cotizacion = memoria.cotizaciones.find((c) => c.id === id);
    agregarNotificacion(cotizacion.clienteId, `${nombreTiendaDe(cotizacion.vendedorId)} respondió tu cotización.`, "/tienda/cotizaciones");
    return completar(cotizacion);
  });

export const cambiarEstadoCotizacion = (id, estado) =>
  llamarApi(`/cotizaciones/${id}/estado`, "PUT", { estado }, () => {
    memoria.cotizaciones = memoria.cotizaciones.map((c) => (c.id === id ? { ...c, estado } : c));
    const cotizacion = memoria.cotizaciones.find((c) => c.id === id);
    const cliente = completar(cotizacion).cliente;
    agregarNotificacion(cotizacion.vendedorId, `${cliente} marcó su cotización como "${estado}".`, "/mi-tienda/cotizaciones");
    return completar(cotizacion);
  });

export const eliminarCotizacion = (id) =>
  llamarApi(`/cotizaciones/${id}`, "DELETE", null, () => {
    memoria.cotizaciones = memoria.cotizaciones.filter((c) => c.id !== id);
    return { id };
  });
