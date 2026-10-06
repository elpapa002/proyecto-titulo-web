import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ProductTable from "../../components/organisms/ProductTable/ProductTable";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { eliminarProducto, obtenerMisProductos } from "../../services/productService";
import { obtenerCategorias } from "../../services/catalogService";

const MyProductsScreen = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState(location.state?.aviso ?? "");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaProductos, respuestaCategorias] = await Promise.all([
        obtenerMisProductos(usuario.id),
        obtenerCategorias(),
      ]);
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      else setAviso("No se pudieron cargar tus publicaciones.");
      if (respuestaCategorias.ok) setCategorias(respuestaCategorias.datos);
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  const confirmarBorrado = async () => {
    const producto = aBorrar;
    console.log("Publicación eliminada:", { id: producto.id, nombre: producto.nombre, sku: producto.sku });
    const respuesta = await eliminarProducto(producto.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    setAviso("Publicación eliminada");
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader
        titulo="Mis publicaciones"
        subtitulo="Crea, consulta, modifica y elimina tus productos y servicios."
        acciones={
          <>
            <CustomButton
              tono="contorno"
              startIcon={<AddIcon />}
              onClick={() => navigate("/mi-tienda/publicaciones/nueva?tipo=servicio")}
            >
              Publicar servicio
            </CustomButton>
            <CustomButton startIcon={<AddIcon />} onClick={() => navigate("/mi-tienda/publicaciones/nueva")}>
              Publicar producto
            </CustomButton>
          </>
        }
      />

      <ProductTable
        productos={productos}
        categorias={categorias}
        cargando={cargando}
        onEditar={(producto) => navigate(`/mi-tienda/publicaciones/${producto.id}/editar`)}
        onEliminar={setABorrar}
      />

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar publicación?"
        mensaje={aBorrar ? `Vas a eliminar «${aBorrar.nombre}». Esta acción no se puede deshacer.` : ""}
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default MyProductsScreen;
