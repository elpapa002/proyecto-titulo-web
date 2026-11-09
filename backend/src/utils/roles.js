export const tieneRol = (usuario, roles) => roles.some((rol) => usuario?.roles.includes(rol));

export const rutaInicio = (usuario) => {
  if (!usuario) return "/login";
  if (usuario.roles.includes("Admin")) return "/resumen";
  if (usuario.roles.includes("Vendedor")) return "/mi-tienda";
  return "/tienda";
};

export const usuariosEjemplo = [
  { rol: "Cliente", run: "20.456.789-1" },
  { rol: "Emprendedor", run: "16.903.557-1" },
  { rol: "Administrador", run: "11.111.111-1" },
];
