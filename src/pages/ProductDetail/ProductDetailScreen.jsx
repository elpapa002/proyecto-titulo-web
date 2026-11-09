import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Grid, Link, Paper, Rating, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckIcon from "@mui/icons-material/Check";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ProductGrid from "../../components/organisms/ProductGrid/ProductGrid";
import ProductQuestions from "../../components/organisms/ProductQuestions/ProductQuestions";
import ProductReviews from "../../components/organisms/ProductReviews/ProductReviews";
import QuoteRequestDialog from "../../components/organisms/QuoteRequestDialog/QuoteRequestDialog";
import QuantitySelector from "../../components/molecules/QuantitySelector/QuantitySelector";
import Notice from "../../components/molecules/Notice/Notice";
import CustomButton from "../../components/atoms/Button/CustomButton";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerProducto, obtenerRelacionados } from "../../services/productService";
import { obtenerPreguntasProducto, crearPregunta } from "../../services/preguntaService";
import { obtenerCalificacionesProducto } from "../../services/calificacionService";
import { obtenerCategorias } from "../../services/catalogService";
import { obtenerCostosEnvio } from "../../services/envioService";
import { crearCotizacion } from "../../services/cotizacionService";
import { calcularEdad, formatearFecha, formatearPrecio, porcentajeDescuento } from "../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };
const deshabilitado = { "&.Mui-disabled": { bgcolor: "primary.main", color: "secondary.main", opacity: 0.45 } };
const recuadro = { display: "flex", gap: 1, alignItems: "flex-start", border: "1px solid", borderColor: "text.primary", borderRadius: 1, p: 1.25 };

const unirConY = (lista) => (lista.length > 1 ? `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}` : lista[0]);

const Dato = ({ texto, valor }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75 }}>
    <Typography>{texto}</Typography>
    <Typography sx={{ textAlign: "right" }}>{valor}</Typography>
  </Box>
);

const FichaProducto = ({ productoId }) => {
  const { usuario } = useUser();
  const { favoritos, alternarFavorito, agregarAlCarro, esMovil } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [costosEnvio, setCostosEnvio] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [relacionados, setRelacionados] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(0);
  const [cotizando, setCotizando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const cargar = async () => {
      const respuesta = await obtenerProducto(productoId);
      if (!respuesta.ok) {
        setCargando(false);
        return;
      }
      const datos = respuesta.datos;
      const [rPreguntas, rCalificaciones, rRelacionados, rCategorias, rEnvios] = await Promise.all([
        obtenerPreguntasProducto(datos.id),
        obtenerCalificacionesProducto(datos.id),
        obtenerRelacionados(datos),
        obtenerCategorias(),
        obtenerCostosEnvio(datos.vendedorId),
      ]);
      setProducto(datos);
      if (rPreguntas.ok) setPreguntas(rPreguntas.datos);
      if (rCalificaciones.ok) setCalificaciones(rCalificaciones.datos);
      if (rRelacionados.ok) setRelacionados(rRelacionados.datos);
      if (rCategorias.ok) setCategorias(rCategorias.datos);
      if (rEnvios.ok) setCostosEnvio(rEnvios.datos);
      setCargando(false);
    };
    cargar();
  }, [productoId]);

  const volver = () => (location.key !== "default" ? navigate(-1) : navigate("/tienda"));

  const cerrarAviso = (_, razon) => {
    if (razon !== "clickaway") setAviso("");
  };

  if (cargando) return <Typography>Cargando publicación...</Typography>;

  const propio = producto?.vendedorId === usuario.id;

  if (!producto || (producto.estado !== "Publicada" && !propio)) {
    return (
      <>
        <PageHeader titulo="Publicación no encontrada" />
        <Paper variant="outlined" sx={{ ...tarjeta, p: 4, textAlign: "center" }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" sx={{ mt: 1 }}>
            {producto ? "Esta publicación no está disponible por ahora." : "Esta publicación no existe."}
          </Typography>
          <Typography sx={{ mt: 1, mb: 2 }}>Puede que el emprendedor la haya pausado o eliminado.</Typography>
          <CustomButton onClick={() => navigate("/tienda")}>Volver a la tienda</CustomButton>
        </Paper>
      </>
    );
  }

  const esServicio = producto.tipo === "Servicio";
  const unidad = esServicio ? "cupos" : "unidades";
  const descuento = porcentajeDescuento(producto);
  const favorito = favoritos.includes(producto.id);
  const sinStock = producto.stock <= 0;
  const categoria = categorias.find((c) => c.id === producto.categoriaId);
  const subcategoria = categoria?.subcategorias.find((s) => s.id === producto.subcategoriaId);
  const textoCategoria = [categoria?.nombre, subcategoria?.nombre].filter(Boolean).join(" › ");
  const edad = calcularEdad(usuario.fechaNacimiento);
  let restriccion = "";
  if (esServicio && producto.edadMinima > 0) {
    if (edad === null) restriccion = "sinFecha";
    else restriccion = edad < producto.edadMinima ? "menor" : "cumple";
  }
  const bloqueado = restriccion === "menor" || restriccion === "sinFecha";
  const comunasEnvio = costosEnvio.map((c) => c.comuna);
  const envioMinimo = costosEnvio.length ? Math.min(...costosEnvio.map((c) => c.costo)) : 0;

  const caracteristicas = esServicio
    ? [
        { texto: "Emprendedor", valor: producto.tienda },
        { texto: "Categoría", valor: textoCategoria },
      ]
    : [
        { texto: "Material principal", valor: producto.material },
        { texto: "Peso", valor: producto.peso },
        { texto: "Tamaño", valor: producto.tamano },
        { texto: "Color", valor: producto.color },
        { texto: "Categoría", valor: textoCategoria },
      ];

  const agregar = () => {
    const error = agregarAlCarro(producto, cantidad);
    if (error) {
      setAgregado(0);
      setAviso(error);
      return;
    }
    console.log("Producto agregado al carro:", { productoId: producto.id, nombre: producto.nombre, cantidad });
    setAgregado(cantidad);
    setCantidad(1);
    setAviso("Agregado al carro");
  };

  const cambiarFavorito = () => {
    console.log("Lista de deseos actualizada:", { productoId: producto.id, guardado: !favorito });
    alternarFavorito(producto.id);
    setAviso(favorito ? "Quitado de tu lista de deseos" : "Guardado en tu lista de deseos");
  };

  const enviarCotizacion = async (datos) => {
    const respuesta = await crearCotizacion(datos);
    if (!respuesta.ok) {
      setAviso(respuesta.error);
      return;
    }
    setCotizando(false);
    setAviso("Solicitud de cotización enviada");
  };

  const preguntar = async (texto) => {
    const datos = { productoId: producto.id, clienteId: usuario.id, texto };
    console.log("Datos para crear pregunta:", datos);
    const respuesta = await crearPregunta(datos);
    if (!respuesta.ok) {
      setAviso("No se pudo enviar la pregunta. Intenta de nuevo.");
      return false;
    }
    setPreguntas((actuales) => [respuesta.datos, ...actuales]);
    setAviso("Pregunta enviada");
    return true;
  };

  return (
    <>
      {esMovil ? (
        <Link
          component="button"
          type="button"
          onClick={volver}
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2, color: "text.primary", fontWeight: 600, textDecoration: "none" }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          Volver
        </Link>
      ) : (
        <Breadcrumbs sx={{ mb: 2.5, fontSize: 12 }}>
          <Link component={RouterLink} to="/tienda" underline="hover" sx={{ color: "text.primary", fontSize: 12 }}>
            Inicio
          </Link>
          {categoria && (
            <Link
              component={RouterLink}
              to={`/tienda?categoria=${categoria.ruta}`}
              underline="hover"
              sx={{ color: "text.primary", fontSize: 12 }}
            >
              {categoria.nombre}
            </Link>
          )}
          {subcategoria && <Typography sx={{ fontSize: 12 }}>{subcategoria.nombre}</Typography>}
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{producto.nombre}</Typography>
        </Breadcrumbs>
      )}

      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{ ...tarjeta, height: { xs: 240, md: 400 }, display: "grid", placeItems: "center" }}
            aria-label="Sin fotos por ahora"
          >
            {esServicio ? (
              <ScheduleOutlinedIcon sx={{ fontSize: 96, color: "text.primary" }} />
            ) : (
              <ImageOutlinedIcon sx={{ fontSize: 96, color: "text.primary" }} />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
            <Link
              component={RouterLink}
              to={`/tienda?buscar=${encodeURIComponent(producto.tienda)}`}
              sx={{ color: "text.primary", fontWeight: 600, textDecorationColor: "inherit" }}
            >
              {producto.tienda}
            </Link>
            {producto.resenas > 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  value={producto.calificacion}
                  precision={0.1}
                  readOnly
                  size="small"
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  sx={{ color: "primary.main", "& .MuiRating-iconEmpty": { color: "primary.main" } }}
                />
                <Typography variant="body2">
                  {producto.calificacion.toLocaleString("es-CL")} ({producto.resenas} reseñas)
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">Sin calificaciones todavía</Typography>
            )}
          </Box>

          <PageHeader titulo={producto.nombre} />

          <Stack spacing={2} sx={{ mt: -1 }}>
            {esServicio && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <StatusChip texto="Servicio" />
                <StatusChip
                  texto={producto.edadMinima > 0 ? `Solo mayores de ${producto.edadMinima} años` : "Sin restricción de edad"}
                />
                {producto.duracion && <StatusChip texto={`Duración: ${producto.duracion}`} />}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 32, fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
                {formatearPrecio(producto.precioOferta ?? producto.precio)}
              </Typography>
              {producto.precioOferta && (
                <Typography sx={{ textDecoration: "line-through" }}>{formatearPrecio(producto.precio)}</Typography>
              )}
              {descuento > 0 && <StatusChip texto={`−${descuento}%`} relleno />}
              <Typography variant="body2">{esServicio ? "por persona, IVA incluido" : "IVA incluido"}</Typography>
            </Box>

            {producto.precioOferta && (
              <Box sx={recuadro}>
                <LocalOfferOutlinedIcon fontSize="small" />
                <Typography>
                  Oferta válida hasta el {formatearFecha(producto.finOferta)}. Después vuelve a su precio normal de{" "}
                  {formatearPrecio(producto.precio)}.
                </Typography>
              </Box>
            )}

            {esServicio ? (
              <Box>
                <Dato texto="Duración" valor={producto.duracion || "A convenir"} />
                <Dato
                  texto="Restricción de edad"
                  valor={producto.edadMinima > 0 ? `${producto.edadMinima} años o más` : "Sin restricción"}
                />
                <Dato texto="Cupos disponibles" valor={sinStock ? "Sin cupos" : producto.stock} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                {producto.sku && <Typography variant="body2">SKU: {producto.sku}</Typography>}
                <StatusChip
                  texto={sinStock ? "Sin stock" : `Stock: ${producto.stock} ${producto.stock === 1 ? "unidad" : "unidades"}`}
                  relleno={sinStock}
                />
              </Box>
            )}

            {restriccion === "cumple" && (
              <Box sx={recuadro}>
                <CheckIcon fontSize="small" />
                <Typography>
                  Tu edad ({edad} años) cumple la restricción de este servicio.
                </Typography>
              </Box>
            )}
            {restriccion === "menor" && (
              <Box sx={recuadro}>
                <WarningAmberOutlinedIcon fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>
                  Este servicio es para mayores de {producto.edadMinima} años. No puedes contratarlo.
                </Typography>
              </Box>
            )}
            {restriccion === "sinFecha" && (
              <Box sx={recuadro}>
                <WarningAmberOutlinedIcon fontSize="small" />
                <Typography>
                  Este servicio es para mayores de {producto.edadMinima} años. Para contratarlo, completa tu fecha de
                  nacimiento en{" "}
                  <Link component={RouterLink} to="/tienda/perfil" sx={{ color: "text.primary", fontWeight: 600, textDecorationColor: "inherit" }}>
                    Mi perfil
                  </Link>
                  .
                </Typography>
              </Box>
            )}

            {propio ? (
              <Box sx={{ ...recuadro, flexWrap: "wrap", alignItems: "center" }}>
                <InfoOutlinedIcon fontSize="small" />
                <Typography sx={{ flex: 1, minWidth: 200 }}>
                  Esta publicación es de tu tienda ({producto.estado.toLowerCase()}). No puedes comprarla, preguntar ni
                  pedir cotización.
                </Typography>
                {usuario.roles.includes("Vendedor") && (
                  <CustomButton tono="contorno" onClick={() => navigate(`/mi-tienda/publicaciones/${producto.id}/editar`)}>
                    Editar publicación
                  </CustomButton>
                )}
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <QuantitySelector
                    valor={cantidad}
                    maximo={producto.stock}
                    onChange={setCantidad}
                    disabled={sinStock || bloqueado}
                    etiqueta={esServicio ? "Cupos" : "Cantidad"}
                  />
                  <CustomButton
                    startIcon={<AddShoppingCartIcon />}
                    onClick={agregar}
                    disabled={sinStock || bloqueado}
                    sx={{ flexGrow: 1, ...deshabilitado }}
                  >
                    Agregar al carro
                  </CustomButton>
                  <CustomButton
                    tono="contorno"
                    startIcon={favorito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={cambiarFavorito}
                    aria-pressed={favorito}
                  >
                    {favorito ? "Guardado" : "Guardar"}
                  </CustomButton>
                </Box>
                <Typography variant="body2" sx={{ mt: "8px !important" }}>
                  {sinStock
                    ? `Sin ${unidad} por ahora. Puedes guardarlo o pedir una cotización.`
                    : `Puedes llevar entre 1 y ${producto.stock} ${unidad}.`}
                </Typography>

                {agregado > 0 && (
                  <Box sx={{ ...recuadro, alignItems: "center", flexWrap: "wrap" }}>
                    <CheckIcon fontSize="small" />
                    <Typography sx={{ flex: 1, minWidth: 180 }}>
                      Agregado al carro: {agregado} {agregado === 1 ? (esServicio ? "cupo" : "unidad") : unidad}.
                    </Typography>
                    <CustomButton tono="contorno" onClick={() => navigate("/tienda/carro")}>
                      Ir al carro
                    </CustomButton>
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <CustomButton tono="contorno" startIcon={<RequestQuoteOutlinedIcon />} onClick={() => setCotizando(true)}>
                    Solicitar cotización
                  </CustomButton>
                  <Button
                    startIcon={<ChatBubbleOutlineIcon />}
                    onClick={() => navigate("/tienda/mensajes", { state: { vendedorId: producto.vendedorId } })}
                    sx={{ color: "text.primary" }}
                  >
                    Enviar mensaje
                  </Button>
                </Box>
              </>
            )}

            {!esServicio && (
              <Box sx={recuadro}>
                <LocalShippingOutlinedIcon fontSize="small" />
                <Typography>
                  {comunasEnvio.length
                    ? `Despacha a ${unirConY(comunasEnvio)}, desde ${formatearPrecio(envioMinimo)}. El costo exacto se calcula en el paso de despacho.`
                    : "Este emprendedor todavía no tiene comunas de despacho."}
                </Typography>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 4, mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ ...tarjeta, height: "100%" }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              {esServicio ? "Descripción del servicio" : "Descripción y características"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>{producto.descripcion}</Typography>
            {caracteristicas
              .filter((c) => c.valor)
              .map((c) => (
                <Dato key={c.texto} texto={c.texto} valor={c.valor} />
              ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductQuestions
            preguntas={preguntas}
            tienda={producto.tienda}
            mostrarFormulario={!propio}
            onPreguntar={preguntar}
          />
        </Grid>
      </Grid>

      <ProductReviews calificaciones={calificaciones} promedio={producto.calificacion} resenas={producto.resenas} />

      <ProductGrid
        titulo="Productos relacionados"
        productos={relacionados}
        favoritos={favoritos}
        onFavorito={alternarFavorito}
        vacio="No hay productos relacionados por ahora."
      />

      {cotizando && (
        <QuoteRequestDialog producto={producto} onCerrar={() => setCotizando(false)} onEnviar={enviarCotizacion} />
      )}

      <Notice mensaje={aviso} onClose={cerrarAviso} />
    </>
  );
};

const ProductDetailScreen = () => {
  const { id } = useParams();
  return <FichaProducto key={id} productoId={Number(id)} />;
};

export default ProductDetailScreen;
