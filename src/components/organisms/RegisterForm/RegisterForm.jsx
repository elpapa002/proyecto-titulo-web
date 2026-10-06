import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../atoms/Button/CustomButton";
import PersonalStep from "../PersonalStep/PersonalStep";
import ContactStep from "../ContactStep/ContactStep";
import CompanyStep from "../CompanyStep/CompanyStep";
import { registrarUsuario } from "../../../services/authService";
import { obtenerUsuarios } from "../../../services/userService";
import { obtenerCompanias } from "../../../services/companyService";
import { formatearRut, formatearRutEscritura, limpiarRut, validarRut } from "../../../utils/rut";
import { calcularEdad, correoValido, errorFechaNacimiento, soloLetras } from "../../../utils/formato";
import { encriptarClave } from "../../../utils/clave";

const datosIniciales = {
  run: "",
  fechaNacimiento: "",
  nombres: "",
  apellidos: "",
  clave: "",
  clave2: "",
  esCliente: true,
  esEmprendedor: false,
  contactos: [{ telefono: "", correo: "" }],
  direcciones: [{ calle: "", numero: "", comuna: "Osorno", codigoPostal: "" }],
  empresa: {
    rut: "",
    nombre: "",
    personas: "",
    telefono: "",
    correo: "",
    sitioWeb: "",
    direccion: "",
    ofreceProductos: true,
    ofreceServicios: false,
  },
};

const RegisterForm = ({ paso, setPaso }) => {
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [companias, setCompanias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const [respuestaUsuarios, respuestaCompanias] = await Promise.all([obtenerUsuarios(), obtenerCompanias()]);
      if (respuestaUsuarios.ok) setUsuarios(respuestaUsuarios.datos);
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
    };
    cargar();
  }, []);

  const quitarError = (clave) => setErrores((actuales) => ({ ...actuales, [clave]: undefined }));

  const cambiar = (e) => {
    const { name, value } = e.target;
    let valor = value;
    if (name === "run") valor = formatearRutEscritura(value);
    if (name === "nombres" || name === "apellidos") valor = soloLetras(value);
    setDatos({ ...datos, [name]: valor });
    quitarError(name);
  };
  const cambiarCasilla = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.checked });
    quitarError("tipoCuenta");
  };

  const cambiarContacto = (i, campo, valor) => {
    const contactos = datos.contactos.map((c, j) => (j === i ? { ...c, [campo]: valor } : c));
    setDatos({ ...datos, contactos });
    quitarError(`${campo}${i}`);
  };
  const agregarContacto = () =>
    setDatos({ ...datos, contactos: [...datos.contactos, { telefono: "", correo: "" }] });

  const cambiarDireccion = (i, campo, valor) => {
    const direcciones = datos.direcciones.map((d, j) => (j === i ? { ...d, [campo]: valor } : d));
    setDatos({ ...datos, direcciones });
    quitarError(`${campo}${i}`);
  };
  const agregarDireccion = () =>
    setDatos({
      ...datos,
      direcciones: [...datos.direcciones, { calle: "", numero: "", comuna: "Osorno", codigoPostal: "" }],
    });

  const cambiarEmpresa = (campo, valor) => {
    const nuevoValor = campo === "rut" ? formatearRutEscritura(valor) : valor;
    setDatos({ ...datos, empresa: { ...datos.empresa, [campo]: nuevoValor } });
    quitarError(campo.startsWith("ofrece") ? "oferta" : campo);
  };

  const validarPaso1 = () => {
    const e = {};
    if (!validarRut(datos.run)) e.run = "RUN no válido. Revisa el dígito verificador.";
    else if (usuarios.some((u) => limpiarRut(u.run) === limpiarRut(datos.run))) e.run = "Este RUN ya tiene una cuenta.";
    const errorFecha = errorFechaNacimiento(datos.fechaNacimiento);
    if (errorFecha) e.fechaNacimiento = errorFecha;
    if (datos.nombres.trim().length < 2) e.nombres = "Ingresa tus nombres, solo letras.";
    if (datos.apellidos.trim().length < 2) e.apellidos = "Ingresa tus apellidos, solo letras.";
    if (datos.clave.length < 8) e.clave = "La clave debe tener al menos 8 caracteres.";
    if (datos.clave2 !== datos.clave) e.clave2 = "Las claves no coinciden.";
    if (!datos.esCliente && !datos.esEmprendedor) e.tipoCuenta = "Marca al menos una opción.";
    return e;
  };

  const validarPaso2 = () => {
    const e = {};
    const correosUsados = usuarios.map((u) => u.correo.toLowerCase());
    datos.contactos.forEach((c, i) => {
      if (i === 0 && !c.correo) e.correo0 = "Ingresa un correo.";
      else if (c.correo && !correoValido(c.correo)) e[`correo${i}`] = "Correo no válido.";
      else if (c.correo && correosUsados.includes(c.correo.toLowerCase()))
        e[`correo${i}`] = "Este correo ya pertenece a otra persona.";
      if (c.telefono && c.telefono.replace(/\D/g, "").length < 8) e[`telefono${i}`] = "Teléfono muy corto.";
    });
    const principal = datos.direcciones[0];
    if (!principal.calle.trim()) e.calle0 = "Ingresa la calle.";
    if (!principal.numero.trim()) e.numero0 = "Ingresa el número.";
    return e;
  };

  const validarPaso3 = () => {
    const e = {};
    const emp = datos.empresa;
    if (!validarRut(emp.rut)) e.rut = "RUT no válido. Revisa el dígito verificador.";
    else if (companias.some((c) => limpiarRut(c.rut) === limpiarRut(emp.rut))) e.rut = "Esta empresa ya está registrada.";
    if (!emp.nombre.trim()) e.nombre = "Ingresa el nombre de la empresa.";
    if (!(Number(emp.personas) >= 1)) e.personas = "Debe ser 1 o más.";
    if (emp.telefono.replace(/\D/g, "").length < 8) e.telefono = "Ingresa un teléfono válido.";
    if (!correoValido(emp.correo)) e.correo = "Correo no válido.";
    if (!emp.ofreceProductos && !emp.ofreceServicios) e.oferta = "Marca al menos una opción.";
    return e;
  };

  const crearCuenta = async (conEmpresa) => {
    setEnviando(true);
    const roles = conEmpresa ? [...(datos.esCliente ? ["Cliente"] : []), "Vendedor"] : ["Cliente"];
    const datosRegistro = {
      run: formatearRut(datos.run),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      fechaNacimiento: datos.fechaNacimiento,
      edad: calcularEdad(datos.fechaNacimiento),
      esMenorDeEdad: calcularEdad(datos.fechaNacimiento) < 18,
      clave: await encriptarClave(datos.clave),
      roles,
      telefonos: datos.contactos.map((c) => c.telefono).filter(Boolean),
      correos: datos.contactos.map((c) => c.correo).filter(Boolean),
      direcciones: datos.direcciones
        .filter((d) => d.calle.trim())
        .map((d, i) => ({ ...d, principal: i === 0 })),
      empresa: conEmpresa
        ? { ...datos.empresa, rut: formatearRut(datos.empresa.rut), personas: Number(datos.empresa.personas) }
        : null,
    };
    console.log("Datos de registro de usuario:", datosRegistro);

    const respuesta = await registrarUsuario(datosRegistro);
    setEnviando(false);
    if (!respuesta.ok) return;

    navigate("/login", { state: { mensaje: "Cuenta creada. Ahora inicia sesión con tu RUN y tu clave." } });
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const accion = evento.nativeEvent.submitter?.value;
    const validaciones = { 1: validarPaso1, 2: validarPaso2, 3: validarPaso3 };
    const nuevosErrores = validaciones[paso]();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    if (paso === 1) setPaso(2);
    else if (paso === 2 && accion === "emprendedor") setPaso(3);
    else if (paso === 2) crearCuenta(false);
    else crearCuenta(true);
  };

  const volver = () => {
    setErrores({});
    if (paso === 1) navigate("/login");
    else setPaso(paso - 1);
  };

  return (
    <Stack component="form" onSubmit={enviar} noValidate spacing={2.5}>
      {paso === 1 && (
        <PersonalStep datos={datos} errores={errores} cambiar={cambiar} cambiarCasilla={cambiarCasilla} />
      )}
      {paso === 2 && (
        <ContactStep
          datos={datos}
          errores={errores}
          cambiarContacto={cambiarContacto}
          agregarContacto={agregarContacto}
          cambiarDireccion={cambiarDireccion}
          agregarDireccion={agregarDireccion}
        />
      )}
      {paso === 3 && <CompanyStep empresa={datos.empresa} errores={errores} cambiarEmpresa={cambiarEmpresa} />}

      <Box sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1.5 }}>
        <CustomButton tono="claro" onClick={volver} disabled={enviando}>
          Volver
        </CustomButton>
        {paso === 1 && (
          <CustomButton tono="claro" type="submit">
            Continuar
          </CustomButton>
        )}
        {paso === 2 && datos.esCliente && (
          <CustomButton tono="claro" type="submit" value="cliente" disabled={enviando}>
            Crear cuenta de cliente
          </CustomButton>
        )}
        {paso === 2 && datos.esEmprendedor && (
          <CustomButton tono="claro" type="submit" value="emprendedor" disabled={enviando}>
            Continuar como emprendedor
          </CustomButton>
        )}
        {paso === 3 && (
          <CustomButton tono="claro" type="submit" disabled={enviando}>
            Crear cuenta y activar mi tienda
          </CustomButton>
        )}
      </Box>
    </Stack>
  );
};

export default RegisterForm;
