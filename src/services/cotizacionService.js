import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { nombreTiendaDe } from "./productService";
import { hoyIso } from "../utils/formato";

const sumarDias = (fechaIso, dias) => {
  const fecha = new Date(`${fechaIso}T12:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

export const DIAS_VIGENCIA = 15;
export const DIAS_PARA_ELIMINAR = 45;
// mismo valor por defecto que el backend (Cotizaciones:ReajusteSemanal)
const REAJUSTE_SEMANAL = 2;

const estaExpirada = (cotizacion) => cotizacion.estado === "Respondida" && cotizacion.respuesta.vigencia < hoyIso();

const diasEntre = (desdeIso, hastaIso) =>
  Math.round((new Date(`${hastaIso}T12:00:00`) - new Date(`${desdeIso}T12:00:00`)) / 86400000);

// el total que vera el cliente despues de expirar: se reajusta una vez por semana
const conReajuste = (cotizacion) => {
  if (!estaExpirada(cotizacion)) return cotizacion.respuesta;
  const semanas = Math.floor((diasEntre(cotizacion.respuesta.vigencia, hoyIso()) - 1) / 7) + 1;
  return {
    ...cotizacion.respuesta,
    totalReajustado: Math.round(cotizacion.respuesta.total * (1 + REAJUSTE_SEMANAL / 100) ** semanas),
    semanasReajuste: semanas,
    reajusteSemanal: REAJUSTE_SEMANAL,
    eliminaEl: sumarDias(cotizacion.respuesta.vigencia, DIAS_PARA_ELIMINAR),
  };
};

const completar = (cotizacion) => {
  const cliente = memoria.usuarios.find((u) => u.id === cotizacion.clienteId);
  return {
    ...cotizacion,
    estado: estaExpirada(cotizacion) ? "Expirada" : cotizacion.estado,
    respuesta: cotizacion.respuesta ? conReajuste(cotizacion) : null,
    cliente: cliente ? `${cliente.nombres.split(" ")[0]} ${cliente.apellidos.split(" ")[0]}` : "Cliente",
    tienda: nombreTiendaDe(cotizacion.vendedorId),
  };
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
    memoria.cotizaciones = memoria.cotizaciones.map((c) => {
      if (c.id !== id) return c;
      // si expiro, se acepta con el total reajustado
      const reajustada = conReajuste(c);
      const respuesta =
        estado === "Aceptada" && reajustada?.totalReajustado ? { ...c.respuesta, total: reajustada.totalReajustado } : c.respuesta;
      return { ...c, estado, respuesta };
    });
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
