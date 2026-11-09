const CAMPOS_CLAVE = ["clave", "clave2", "claveActual", "claveNueva"];

// para los console.log, asi no se ven las claves
export const ocultarClaves = (datos) => {
  const copia = { ...datos };
  CAMPOS_CLAVE.forEach((campo) => {
    if (copia[campo]) copia[campo] = "********";
  });
  return copia;
};
