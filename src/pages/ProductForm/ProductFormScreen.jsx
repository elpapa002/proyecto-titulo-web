import { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ProductForm from "../../components/organisms/ProductForm/ProductForm";
import CustomButton from "../../components/atoms/Button/CustomButton";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import {
  actualizarProducto,
  crearProducto,
  eliminarFoto,
  obtenerMisProductos,
  subirFoto,
} from "../../services/productService";
import { obtenerCategorias } from "../../services/catalogService";

const ProductFormScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const [respuestaProductos, respuestaCategorias] = await Promise.all([
        obtenerMisProductos(usuario.id),
        obtenerCategorias(),
      ]);
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      if (respuestaCategorias.ok) setCategorias(respuestaCategorias.datos);
      setCargando(false);
    };
    cargar();
  }, [usuario.id]);

  const producto = id ? productos.find((p) => p.id === Number(id)) : null;
  const volver = () => navigate("/mi-tienda/publicaciones");

  const guardar = async (datos, fotos) => {
    const respuesta = producto
      ? await actualizarProducto(producto.id, datos)
      : await crearProducto({ ...datos, vendedorId: usuario.id });
    if (!respuesta.ok) {
      setAviso(respuesta.error ?? "No se pudo guardar. Intenta de nuevo.");
      return;
    }
    // primero se quitan las fotos borradas (asi hay espacio para las nuevas) y despues se suben las nuevas
    const productoId = respuesta.datos.id;
    const errores = [];
    for (const id of fotos.borradas) {
      const r = await eliminarFoto(id);
      if (!r.ok) errores.push(r.error);
    }
    for (const foto of fotos.nuevas) {
      const r = await subirFoto(productoId, foto);
      if (!r.ok) errores.push(`${foto.nombre}: ${r.error}`);
    }
    if (errores.length > 0) {
      setAviso(`La publicación se guardó, pero hubo un problema con las fotos. ${errores[0]}`);
      return;
    }
    const texto = producto ? "Publicación actualizada" : datos.estado === "Borrador" ? "Borrador guardado" : "Publicación creada";
    navigate("/mi-tienda/publicaciones", { state: { aviso: texto } });
  };

  if (cargando) {
    return <PageHeader titulo="Publicación" subtitulo="Cargando..." />;
  }

  if (id && !producto) {
    return (
      <>
        <PageHeader titulo="Publicación" />
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 1.5, borderColor: "text.primary", textAlign: "center" }}>
          <Typography variant="h3">No encontramos esta publicación</Typography>
          <Typography sx={{ mt: 1, mb: 2 }}>Puede que la hayas eliminado o que pertenezca a otra tienda.</Typography>
          <CustomButton onClick={volver}>Volver a mis publicaciones</CustomButton>
        </Paper>
      </>
    );
  }

  return (
    <>
      <ProductForm
        key={producto?.id ?? params.get("tipo") ?? "nuevo"}
        producto={producto}
        tipoNuevo={params.get("tipo") === "servicio" ? "Servicio" : "Producto"}
        categorias={categorias}
        productos={productos}
        onGuardar={guardar}
        onCancelar={volver}
      />
      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default ProductFormScreen;
