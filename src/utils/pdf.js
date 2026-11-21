import { formatearFecha, formatearPrecio, hoyIso } from "./formato";

// colores de la paleta del proyecto
const AZUL = [29, 42, 59];
const GRIS = [43, 46, 51];
const BLANCO = [255, 255, 255];
const MARGEN = 15;

// jspdf se carga recien cuando alguien descarga, asi la pagina parte mas liviana
const cargarPdf = async () => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  return { doc: new jsPDF({ unit: "mm", format: "a4" }), autoTable };
};

const ahora = () => {
  const fecha = new Date();
  const hora = fecha.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${formatearFecha(hoyIso())} ${hora}`;
};

const encabezado = (doc, titulo, subtitulo) => {
  const ancho = doc.internal.pageSize.getWidth();
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, ancho, 28, "F");
  doc.setTextColor(...BLANCO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, MARGEN, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitulo, MARGEN, 21);
  doc.text("Compra y Venta", ancho - MARGEN, 13, { align: "right" });
  doc.text(`Generado el ${ahora()}`, ancho - MARGEN, 21, { align: "right" });
  doc.setTextColor(...GRIS);
  return 38;
};

// si el titulo quedaria solo al final de la hoja, pasa a la siguiente
const subtitulo = (doc, texto, y) => {
  if (y > doc.internal.pageSize.getHeight() - 45) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...AZUL);
  doc.text(texto, MARGEN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRIS);
  return y + 4;
};

const tabla = (autoTable, doc, y, head, body, columnas = {}) => {
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: MARGEN, right: MARGEN },
    styles: { font: "helvetica", fontSize: 10, textColor: GRIS, lineColor: GRIS, lineWidth: 0.1 },
    headStyles: { fillColor: AZUL, textColor: BLANCO, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [244, 245, 246] },
    columnStyles: columnas,
  });
  return doc.lastAutoTable.finalY + 10;
};

// barras simples dibujadas con rectangulos
const grafico = (doc, meses, y) => {
  const ancho = doc.internal.pageSize.getWidth() - MARGEN * 2;
  const alto = 45;
  if (y + alto + 12 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    y = 20;
  }
  const maximo = Math.max(1, ...meses.map((m) => m.total));
  const espacio = ancho / meses.length;
  const barra = Math.min(14, espacio * 0.6);

  doc.setDrawColor(...GRIS);
  doc.setLineWidth(0.2);
  doc.line(MARGEN, y + alto, MARGEN + ancho, y + alto);
  doc.setFontSize(8);
  meses.forEach((m, i) => {
    const x = MARGEN + espacio * i + (espacio - barra) / 2;
    const h = (m.total / maximo) * (alto - 8);
    doc.setFillColor(...(i === meses.length - 1 ? AZUL : GRIS));
    if (h > 0) doc.rect(x, y + alto - h, barra, h, "F");
    doc.text(m.etiqueta, x + barra / 2, y + alto + 4, { align: "center" });
    doc.text(formatearPrecio(m.total), x + barra / 2, y + alto - h - 1.5, { align: "center" });
  });
  return y + alto + 12;
};

const pie = (doc) => {
  const paginas = doc.getNumberOfPages();
  const alto = doc.internal.pageSize.getHeight();
  const ancho = doc.internal.pageSize.getWidth();
  doc.setFontSize(8);
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.text(`Página ${i} de ${paginas}`, ancho - MARGEN, alto - 8, { align: "right" });
  }
};

const nombreArchivo = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .toLowerCase();

const periodo = (reporte) => `Del ${formatearFecha(reporte.desde)} al ${formatearFecha(reporte.hasta)}`;

const tablaMeses = (reporte) =>
  reporte.ventasPorMes.map((m) => [`${m.etiqueta} ${m.mes.slice(0, 4)}`, m.pedidos, formatearPrecio(m.total)]);

const derecha = { halign: "right" };

export const descargarReporteVendedor = async (reporte) => {
  const { doc, autoTable } = await cargarPdf();
  let y = encabezado(doc, `Reporte de ventas - ${reporte.tienda}`, periodo(reporte));

  y = subtitulo(doc, "Resumen", y);
  y = tabla(
    autoTable,
    doc,
    y,
    ["Indicador", "Valor"],
    [
      ["Ventas del período (IVA incluido)", formatearPrecio(reporte.totalVentas)],
      ["Pedidos", `${reporte.pedidos} (${reporte.cancelados} cancelados)`],
      ["Venta promedio por pedido", formatearPrecio(reporte.ventaPromedio)],
      [
        "Calificación promedio",
        reporte.resenas ? `${String(reporte.calificacionPromedio).replace(".", ",")} de 5 (${reporte.resenas} reseñas)` : "Sin reseñas",
      ],
    ],
    { 1: derecha }
  );

  y = subtitulo(doc, "Ventas por mes", y);
  y = grafico(doc, reporte.ventasPorMes, y + 2);
  y = tabla(autoTable, doc, y, ["Mes", "Pedidos", "Total"], tablaMeses(reporte), { 1: derecha, 2: derecha });

  y = subtitulo(doc, "Productos más vendidos", y);
  const productos = reporte.productosMasVendidos.length
    ? reporte.productosMasVendidos.map((p) => [p.lugar, p.nombre, p.unidades, formatearPrecio(p.total)])
    : [["-", "Sin ventas en el período", "-", "-"]];
  y = tabla(autoTable, doc, y, ["Lugar", "Producto", "Unidades", "Total vendido"], productos, { 2: derecha, 3: derecha });

  y = subtitulo(doc, "Calificaciones", y);
  tabla(
    autoTable,
    doc,
    y,
    ["Estrellas", "Reseñas", "Porcentaje"],
    reporte.calificaciones.map((c) => [`${c.estrellas} ${c.estrellas === 1 ? "estrella" : "estrellas"}`, c.cantidad, `${c.porcentaje}%`]),
    { 1: derecha, 2: derecha }
  );

  pie(doc);
  doc.save(`reporte-${nombreArchivo(reporte.tienda)}-${reporte.desde}-al-${reporte.hasta}.pdf`);
};

export const descargarReportePlataforma = async (reporte) => {
  const { doc, autoTable } = await cargarPdf();
  let y = encabezado(doc, "Resumen de la plataforma", periodo(reporte));

  y = subtitulo(doc, "Resumen", y);
  y = tabla(
    autoTable,
    doc,
    y,
    ["Indicador", "Valor"],
    [
      ["Ventas del período (IVA incluido)", formatearPrecio(reporte.totalVentas)],
      ["Pedidos", `${reporte.pedidos} (${reporte.cancelados} cancelados)`],
      ["Venta promedio por pedido", formatearPrecio(reporte.ventaPromedio)],
      ["Usuarios registrados", `${reporte.usuarios} (${reporte.usuariosNuevos} nuevos en el período)`],
      ["Clientes / emprendedores / administradores", `${reporte.clientes} / ${reporte.emprendedores} / ${reporte.administradores}`],
      ["Emprendedores con ventas en el período", reporte.emprendedoresConVentas],
    ],
    { 1: derecha }
  );

  y = subtitulo(doc, "Ventas por mes", y);
  y = grafico(doc, reporte.ventasPorMes, y + 2);
  y = tabla(autoTable, doc, y, ["Mes", "Pedidos", "Total"], tablaMeses(reporte), { 1: derecha, 2: derecha });

  y = subtitulo(doc, "Tiendas con más ventas", y);
  const tiendas = reporte.tiendasMasVendedoras.length
    ? reporte.tiendasMasVendedoras.map((t) => [t.lugar, t.tienda, t.pedidos, formatearPrecio(t.total)])
    : [["-", "Sin ventas en el período", "-", "-"]];
  y = tabla(autoTable, doc, y, ["Lugar", "Tienda", "Pedidos", "Total vendido"], tiendas, { 2: derecha, 3: derecha });

  if (reporte.alertas.length) {
    y = subtitulo(doc, "Alertas", y);
    tabla(autoTable, doc, y, ["Detalle"], reporte.alertas.map((a) => [a]));
  }

  pie(doc);
  doc.save(`resumen-plataforma-${reporte.desde}-al-${reporte.hasta}.pdf`);
};

export const descargarBoleta = async (venta, cliente) => {
  const { doc, autoTable } = await cargarPdf();
  let y = encabezado(doc, `Boleta electrónica N° ${venta.id}`, `${venta.tienda} · ${formatearFecha(venta.fecha)}`);

  const neto = Math.round(venta.total / 1.19);
  const { tipo, marca, ultimos4 } = venta.medioPago;
  y = tabla(
    autoTable,
    doc,
    y,
    ["Dato", "Detalle"],
    [
      ["Cliente", `${cliente.nombres} ${cliente.apellidos}`],
      ...(cliente.run ? [["RUN cliente", cliente.run]] : []),
      ["Despacho a", venta.direccion],
      ["Medio de pago", `${tipo} ${marca} terminada en ${ultimos4}`],
      ["Estado", `Transacción ${venta.estadoTransaccion.toLowerCase()}`],
    ]
  );
  y = tabla(
    autoTable,
    doc,
    y,
    ["Producto", "Cantidad", "Precio", "Subtotal"],
    [
      ...venta.items.map((i) => [i.nombre, i.cantidad, formatearPrecio(i.precio), formatearPrecio(i.precio * i.cantidad)]),
      ["Despacho", "", "", formatearPrecio(venta.envio)],
    ],
    { 1: derecha, 2: derecha, 3: derecha }
  );
  tabla(
    autoTable,
    doc,
    y,
    ["Total", "Monto"],
    [
      ["Valor neto", formatearPrecio(neto)],
      ["IVA (19%)", formatearPrecio(venta.total - neto)],
      ["Total pagado", formatearPrecio(venta.total)],
    ],
    { 1: derecha }
  );

  pie(doc);
  doc.save(`boleta-${venta.id}.pdf`);
};
