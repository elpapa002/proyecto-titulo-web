import { useEffect, useState } from "react";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import UserTable from "../../components/organisms/UserTable/UserTable";
import UserFormDialog from "../../components/organisms/UserFormDialog/UserFormDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuarios } from "../../services/userService";
import { obtenerCompanias } from "../../services/companyService";
import { nombreCorto } from "../../utils/formato";

const UsersScreen = () => {
  const { usuario: usuarioSesion, actualizarUsuarioSesion } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [companias, setCompanias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaUsuarios, respuestaCompanias] = await Promise.all([obtenerUsuarios(), obtenerCompanias()]);
      if (respuestaUsuarios.ok) setUsuarios(respuestaUsuarios.datos);
      else setAviso("No se pudieron cargar los usuarios.");
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
      setCargando(false);
    };
    cargar();
  }, [recargas]);

  const guardar = async (datos) => {
    const original = formulario.usuario;
    const respuesta = original ? await actualizarUsuario(original.id, datos) : await crearUsuario(datos);
    if (!respuesta.ok) {
      setAviso("No se pudo guardar. Intenta de nuevo.");
      return;
    }

    if (original && usuarioSesion?.id === original.id) actualizarUsuarioSesion(datos);
    setAviso(original ? "Usuario actualizado" : "Usuario agregado");
    setFormulario(null);
    setRecargas((n) => n + 1);
  };

  const pedirBorrado = (usuario) => {
    if (usuario.id === usuarioSesion?.id) {
      setAviso("No puedes eliminar tu propia cuenta mientras estás conectado.");
      return;
    }
    setABorrar(usuario);
  };

  const confirmarBorrado = async () => {
    const usuario = aBorrar;
    console.log("Usuario eliminado:", { id: usuario.id, run: usuario.run });
    const respuesta = await eliminarUsuario(usuario.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    setAviso("Usuario eliminado");
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader titulo="Gestión de usuarios" subtitulo="Revisa, filtra, edita y agrega usuarios de la plataforma." />

      <UserTable
        usuarios={usuarios}
        companias={companias}
        cargando={cargando}
        onAgregar={() => setFormulario({ usuario: null })}
        onEditar={(usuario) => setFormulario({ usuario })}
        onEliminar={pedirBorrado}
      />

      {formulario && (
        <UserFormDialog
          usuario={formulario.usuario}
          usuarios={usuarios}
          companias={companias}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar usuario?"
        mensaje={
          aBorrar
            ? `Vas a eliminar a ${nombreCorto(aBorrar)} (RUN ${aBorrar.run}). Esta acción no se puede deshacer.`
            : ""
        }
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default UsersScreen;
