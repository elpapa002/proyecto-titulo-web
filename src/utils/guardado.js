// guarda el carro y la lista de deseos de cada usuario en el navegador, asi no se pierden al recargar la pagina
const clave = (tipo, usuarioId) => `compraventa-${tipo}-${usuarioId}`;

export const leerGuardado = (tipo, usuarioId) => {
  try {
    const texto = localStorage.getItem(clave(tipo, usuarioId));
    const valor = texto ? JSON.parse(texto) : [];
    return Array.isArray(valor) ? valor : [];
  } catch {
    return [];
  }
};

export const escribirGuardado = (tipo, usuarioId, valor) => {
  try {
    localStorage.setItem(clave(tipo, usuarioId), JSON.stringify(valor));
  } catch {
    // si el navegador no deja guardar, el carro igual funciona mientras la pagina este abierta
  }
};

// un mismo producto puede estar en el carro con distintas variantes (talla o color)
export const claveItem = (productoId, varianteId) => (varianteId ? `${productoId}-${varianteId}` : `${productoId}`);
