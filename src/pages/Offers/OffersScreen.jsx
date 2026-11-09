import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import OfferTable from "../../components/organisms/OfferTable/OfferTable";
import OfferFormDialog from "../../components/organisms/OfferFormDialog/OfferFormDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { actualizarOferta, crearOferta, eliminarOferta, obtenerMisOfertas } from "../../services/ofertaService";
import { obtenerMisProductos } from "../../services/productService";
import { hoyIso } from "../../utils/formato";

const estadoOferta = (oferta, hoy) => {
  if (oferta.inicio > hoy) return "Programada";
  if (oferta.fin < hoy) return "Terminada";
  return "Activa";
};

const OffersScreen = () => {
  const { usuario } = useUser();
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaOfertas, respuestaProductos] = await Promise.all([
        obtenerMisOfertas(usuario.id),
        obtenerMisProductos(usuario.id),
      ]);
      if (respuestaOfertas.ok) setOfertas(respuestaOfertas.datos);
      else setAviso("No se pudieron cargar tus ofertas.");
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const hoy = hoyIso();
  const ofertasConEstado = ofertas.map((o) => ({ ...o, estado: estadoOferta(o, hoy) }));

  const guardar = async (datos) => {
    const original = formulario.oferta;
    const datosOferta = { vendedorId: usuario.id, ...datos };
    console.log(original ? "Datos para actualizar oferta:" : "Datos para crear oferta:", datosOferta);
    const respuesta = original
      ? await actualizarOferta(original.id, datosOferta)
      : await crearOferta(datosOferta);
    if (!respuesta.ok) return respuesta.error;

    if (original) setAviso("Oferta actualizada");
    else setAviso(datos.difundir ? "Oferta creada y avisada a tus clientes" : "Oferta creada");
    setFormulario(null);
    setRecargas((n) => n + 1);
    return "";
  };

  const confirmarBorrado = async () => {
    const oferta = aBorrar;
    const respuesta = await eliminarOferta(oferta.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    console.log("Oferta eliminada:", { id: oferta.id, producto: oferta.nombreProducto, precioOferta: oferta.precioOferta });
    setAviso("Oferta eliminada");
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader
        titulo="Ofertas"
        subtitulo="Define precios de oferta por un tiempo. Cuando una oferta termina, la publicación vuelve sola a su precio normal."
        acciones={
          <CustomButton startIcon={<AddIcon />} onClick={() => setFormulario({ oferta: null })}>
            Crear oferta
          </CustomButton>
        }
      />

      <OfferTable
        ofertas={ofertasConEstado}
        cargando={cargando}
        onEditar={(oferta) => setFormulario({ oferta })}
        onEliminar={setABorrar}
      />

      {formulario && (
        <OfferFormDialog
          oferta={formulario.oferta}
          productos={productos}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar oferta?"
        mensaje={
          aBorrar
            ? `Vas a eliminar la oferta de "${aBorrar.nombreProducto}". ${
                aBorrar.estado === "Activa" ? "La publicación vuelve de inmediato a su precio normal. " : ""
              }Esta acción no se puede deshacer.`
            : ""
        }
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default OffersScreen;
