export const formatearFecha = (fechaIso) => {
  if (!fechaIso) return "";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}-${mes}-${anio}`;
};

export const hoyIso = () => {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

export const calcularEdad = (fechaIso) => {
  if (!fechaIso) return null;
  const nacimiento = new Date(`${fechaIso}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad--;
  return edad;
};

export const nombreCorto = (usuario) => {
  const nombre = usuario.nombres.split(" ")[0] ?? "";
  const apellido = usuario.apellidos.split(" ")[0] ?? "";
  return `${nombre} ${apellido}`.trim();
};

export const iniciales = (usuario) => {
  const nombre = usuario.nombres?.[0] ?? "";
  const apellido = usuario.apellidos?.[0] ?? "";
  return `${nombre}${apellido}`.toUpperCase();
};

export const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export const nombreCompania = (usuario, companias) => {
  if (usuario.companiaId) return companias.find((c) => c.id === usuario.companiaId)?.nombre ?? "Sin compañía";
  return usuario.roles.includes("Admin") ? "Administración" : "Sin compañía";
};

export const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export const nombreTienda = (usuario, companias) =>
  companias.find((c) => c.id === usuario.companiaId)?.nombre ?? nombreCorto(usuario);

export const formatearPrecio = (valor) => `$${Number(valor).toLocaleString("es-CL")}`;

export const porcentajeDescuento = (producto) =>
  producto.precioOferta ? Math.round((1 - producto.precioOferta / producto.precio) * 100) : 0;

export const soloLetras = (texto) => texto.replace(/[^\p{L}\s'-]/gu, "").replace(/\s{2,}/g, " ");

export const errorFechaNacimiento = (fechaIso) => {
  if (!fechaIso) return "Ingresa tu fecha de nacimiento.";
  if (Number(fechaIso.slice(0, 4)) < 1900) return "Revisa el año, debe ser desde 1900.";
  if (fechaIso > hoyIso()) return "La fecha no puede ser futura.";
  return null;
};
