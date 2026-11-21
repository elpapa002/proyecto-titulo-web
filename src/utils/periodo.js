import { hoyIso } from "./formato";

export const PERIODOS = [
  { valor: "mes", texto: "Mes", meses: 1 },
  { valor: "trimestre", texto: "Trimestre", meses: 3 },
  { valor: "semestre", texto: "Semestre", meses: 6 },
  { valor: "anio", texto: "Año", meses: 12 },
];

export const MESES_MAXIMOS = 24;

// desde el primer dia del mes que corresponda hasta hoy
export const rangoPeriodo = (valor) => {
  const { meses } = PERIODOS.find((p) => p.valor === valor);
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1);
  const mes = String(inicio.getMonth() + 1).padStart(2, "0");
  return { desde: `${inicio.getFullYear()}-${mes}-01`, hasta: hoyIso() };
};

export const erroresPeriodo = ({ desde, hasta }) => {
  const e = {};
  if (!desde) e.desde = "Ingresa la fecha de inicio.";
  if (!hasta) e.hasta = "Ingresa la fecha de término.";
  else if (hasta > hoyIso()) e.hasta = "No puede ser una fecha futura.";
  if (desde && hasta && desde > hasta) e.desde = "No puede ser posterior a la fecha de término.";
  else if (desde && hasta) {
    const [a1, m1] = desde.split("-").map(Number);
    const [a2, m2] = hasta.split("-").map(Number);
    if ((a2 - a1) * 12 + m2 - m1 + 1 > MESES_MAXIMOS) e.desde = `El período puede abarcar como máximo ${MESES_MAXIMOS} meses.`;
  }
  return e;
};
