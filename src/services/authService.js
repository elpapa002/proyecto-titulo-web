import { llamarApi, siguienteId } from "./api";
import { memoria } from "./datosPrueba";
import { limpiarRut } from "../utils/rut";
import { hoyIso } from "../utils/formato";

export const iniciarSesion = (datos) =>
  llamarApi("/login", "POST", datos, () => {
    const registrado = memoria.usuarios.find((u) => limpiarRut(u.run) === limpiarRut(datos.run));
    const usuario = registrado ?? {
      id: 0,
      run: datos.run,
      nombres: "Usuario",
      apellidos: "Invitado",
      correo: "",
      roles: ["Cliente"],
      companiaId: null,
    };
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return { usuario, token };
  });

export const registrarUsuario = (datos) =>
  llamarApi("/usuarios/registro", "POST", datos, () => {
    let companiaId = null;
    if (datos.empresa) {
      const compania = { ...datos.empresa, id: siguienteId(memoria.companias) };
      memoria.companias = [compania, ...memoria.companias];
      companiaId = compania.id;
    }
    const usuario = {
      id: siguienteId(memoria.usuarios),
      run: datos.run,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      correo: datos.correos[0],
      fechaNacimiento: datos.fechaNacimiento,
      fechaIngreso: hoyIso(),
      roles: datos.roles,
      companiaId,
    };
    memoria.usuarios = [usuario, ...memoria.usuarios];
    datos.direcciones.forEach((direccion) => {
      memoria.direcciones = [...memoria.direcciones, { ...direccion, id: siguienteId(memoria.direcciones), usuarioId: usuario.id }];
    });
    datos.telefonos.forEach((numero) => {
      memoria.telefonos = [...memoria.telefonos, { id: siguienteId(memoria.telefonos), usuarioId: usuario.id, numero }];
    });
    return usuario;
  });
