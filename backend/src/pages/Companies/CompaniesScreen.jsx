import { useEffect, useState } from "react";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import CompanyTable from "../../components/organisms/CompanyTable/CompanyTable";
import CompanyFormDialog from "../../components/organisms/CompanyFormDialog/CompanyFormDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import Notice from "../../components/molecules/Notice/Notice";
import {
  actualizarCompania,
  crearCompania,
  eliminarCompania,
  obtenerCompanias,
} from "../../services/companyService";
import { obtenerUsuarios } from "../../services/userService";

const CompaniesScreen = () => {
  const [companias, setCompanias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaCompanias, respuestaUsuarios] = await Promise.all([obtenerCompanias(), obtenerUsuarios()]);
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
      else setAviso("No se pudieron cargar las compañías.");
      if (respuestaUsuarios.ok) setUsuarios(respuestaUsuarios.datos);
      setCargando(false);
    };
    cargar();
  }, [recargas]);

  const guardar = async (datos) => {
    const original = formulario.compania;
    const respuesta = original ? await actualizarCompania(original.id, datos) : await crearCompania(datos);
    if (!respuesta.ok) {
      setAviso("No se pudo guardar. Intenta de nuevo.");
      return;
    }
    setAviso(original ? "Compañía actualizada" : "Compañía agregada");
    setFormulario(null);
    setRecargas((n) => n + 1);
  };

  const confirmarBorrado = async () => {
    const compania = aBorrar;
    console.log("Compañía eliminada:", { id: compania.id, rut: compania.rut });
    const respuesta = await eliminarCompania(compania.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    setAviso("Compañía eliminada");
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader titulo="Compañías" subtitulo="Empresas registradas por los emprendedores de la plataforma." />

      <CompanyTable
        companias={companias}
        usuarios={usuarios}
        cargando={cargando}
        onAgregar={() => setFormulario({ compania: null })}
        onEditar={(compania) => setFormulario({ compania })}
        onEliminar={setABorrar}
      />

      {formulario && (
        <CompanyFormDialog
          compania={formulario.compania}
          companias={companias}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar compañía?"
        mensaje={
          aBorrar
            ? `Vas a eliminar ${aBorrar.nombre} (RUT ${aBorrar.rut}). Sus emprendedores quedarán como independientes.`
            : ""
        }
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default CompaniesScreen;
