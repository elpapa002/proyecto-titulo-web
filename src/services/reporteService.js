import { llamarApi } from "./api";
import { memoria } from "./datosPrueba";
import { nombreTiendaDe } from "./productService";

const NOMBRES_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const enPeriodo = (fecha, desde, hasta) => fecha >= desde && fecha <= hasta;

const promedio = (total, cantidad) => (cantidad ? Math.round(total / cantidad) : 0);

// un elemento por cada mes del periodo, aunque no tenga ventas
const porMes = (ventas, desde, hasta) => {
  const meses = [];
  let [anio, mes] = desde.split("-").map(Number);
  const [anioFin, mesFin] = hasta.split("-").map(Number);
  while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
    const clave = `${anio}-${String(mes).padStart(2, "0")}`;
    const delMes = ventas.filter((v) => v.fecha.startsWith(clave));
    meses.push({
      mes: clave,
      etiqueta: NOMBRES_MES[mes - 1],
      pedidos: delMes.length,
      total: delMes.reduce((suma, v) => suma + v.total, 0),
    });
    mes += 1;
    if (mes > 12) {
      mes = 1;
      anio += 1;
    }
  }
  return meses;
};

const conLugar = (lista) => lista.slice(0, 5).map((fila, i) => ({ lugar: i + 1, ...fila }));

const consulta = (desde, hasta) => `?desde=${desde}&hasta=${hasta}`;

export const obtenerReporteVendedor = (vendedorId, desde, hasta) =>
  llamarApi(`/vendedores/${vendedorId}/reportes${consulta(desde, hasta)}`, "GET", null, () => {
    const ventas = memoria.ventas.filter((v) => v.vendedorId === vendedorId && enPeriodo(v.fecha, desde, hasta));
    const validas = ventas.filter((v) => v.estadoTransaccion !== "Cancelada");
    const notas = memoria.calificaciones
      .filter((c) => c.vendedorId === vendedorId && enPeriodo(c.fecha, desde, hasta))
      .map((c) => c.notaProducto);

    const vendidos = {};
    validas.forEach((venta) =>
      venta.items.forEach((item) => {
        const fila = vendidos[item.productoId] ?? { productoId: item.productoId, nombre: item.nombre, unidades: 0, total: 0 };
        fila.unidades += item.cantidad;
        fila.total += item.cantidad * item.precio;
        vendidos[item.productoId] = fila;
      })
    );

    const total = validas.reduce((suma, v) => suma + v.total, 0);
    return {
      tienda: nombreTiendaDe(vendedorId),
      desde,
      hasta,
      totalVentas: total,
      pedidos: validas.length,
      cancelados: ventas.length - validas.length,
      ventaPromedio: promedio(total, validas.length),
      calificacionPromedio: notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : 0,
      resenas: notas.length,
      calificaciones: [5, 4, 3, 2, 1].map((estrellas) => {
        const cantidad = notas.filter((n) => n === estrellas).length;
        return { estrellas, cantidad, porcentaje: notas.length ? Math.round((cantidad * 100) / notas.length) : 0 };
      }),
      ventasPorMes: porMes(validas, desde, hasta),
      productosMasVendidos: conLugar(
        Object.values(vendidos).sort((a, b) => b.unidades - a.unidades || b.total - a.total)
      ),
    };
  });

export const obtenerReportePlataforma = (desde, hasta) =>
  llamarApi(`/reportes/plataforma${consulta(desde, hasta)}`, "GET", null, () => {
    const ventas = memoria.ventas.filter((v) => enPeriodo(v.fecha, desde, hasta));
    const validas = ventas.filter((v) => v.estadoTransaccion !== "Cancelada");
    const usuarios = memoria.usuarios;

    const tiendas = {};
    validas.forEach((venta) => {
      const fila = tiendas[venta.vendedorId] ?? {
        vendedorId: venta.vendedorId,
        tienda: nombreTiendaDe(venta.vendedorId),
        pedidos: 0,
        total: 0,
      };
      fila.pedidos += 1;
      fila.total += venta.total;
      tiendas[venta.vendedorId] = fila;
    });

    const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
    const stockBajo = memoria.productos.filter((p) => p.tipo === "Producto" && p.estado !== "Borrador" && p.stock <= 3).length;
    const devoluciones = memoria.devoluciones.filter((d) => d.estado === "Pendiente").length;
    const cotizaciones = memoria.cotizaciones.filter((c) => c.estado === "Pendiente").length;
    const preguntas = memoria.preguntas.filter((p) => !p.respuesta).length;
    const alertas = [
      stockBajo && `${plural(stockBajo, "publicación tiene", "publicaciones tienen")} stock bajo o sin stock.`,
      devoluciones && `${plural(devoluciones, "devolución espera", "devoluciones esperan")} la respuesta del emprendedor.`,
      cotizaciones && `${plural(cotizaciones, "cotización sigue", "cotizaciones siguen")} sin responder.`,
      preguntas && `${plural(preguntas, "pregunta de cliente sigue", "preguntas de clientes siguen")} sin respuesta.`,
    ].filter(Boolean);

    const total = validas.reduce((suma, v) => suma + v.total, 0);
    return {
      desde,
      hasta,
      totalVentas: total,
      pedidos: validas.length,
      cancelados: ventas.length - validas.length,
      ventaPromedio: promedio(total, validas.length),
      usuarios: usuarios.length,
      usuariosNuevos: usuarios.filter((u) => u.fechaIngreso && enPeriodo(u.fechaIngreso, desde, hasta)).length,
      clientes: usuarios.filter((u) => u.roles.includes("Cliente")).length,
      emprendedores: usuarios.filter((u) => u.roles.includes("Vendedor")).length,
      administradores: usuarios.filter((u) => u.roles.includes("Admin")).length,
      emprendedoresConVentas: Object.keys(tiendas).length,
      ventasPorMes: porMes(validas, desde, hasta),
      tiendasMasVendedoras: conLugar(Object.values(tiendas).sort((a, b) => b.total - a.total)),
      alertas,
    };
  });
