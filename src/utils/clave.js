import bcrypt from "bcryptjs";

const saltRounds = 10;

export const encriptarClave = (clave) => bcrypt.hash(clave, saltRounds);
