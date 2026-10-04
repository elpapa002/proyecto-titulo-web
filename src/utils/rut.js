export const limpiarRut = (rut) => rut.replace(/[^0-9kK]/g, "").toUpperCase();

export const calcularDv = (numero) => {
  let suma = 0;
  let multiplicador = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += Number(numero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
};

export const validarRut = (rut) => {
  const limpio = limpiarRut(rut);
  if (limpio.length < 8) return false;
  const numero = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(numero)) return false;
  return calcularDv(numero) === dv;
};

export const formatearRut = (rut) => {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;
  const numero = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${numero}-${limpio.slice(-1)}`;
};
