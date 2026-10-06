import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import OrderTable from "../../components/organisms/OrderTable/OrderTable";
import StatCard from "../../components/molecules/StatCard/StatCard";
import CustomButton from "../../components/atoms/Button/CustomButton";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerMisPedidos, obtenerMisProductos } from "../../services/productService";
import { obtenerCompanias } from "../../services/companyService";
import { formatearPrecio, nombreTienda } from "../../utils/formato";

const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`;

const StoreSummaryScreen = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [companias, setCompanias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const [respuestaProductos, respuestaPedidos, respuestaCompanias] = await Promise.all([
        obtenerMisProductos(usuario.id),
        obtenerMisPedidos(usuario.id),
        obtenerCompanias(),
      ]);
      if (respuestaProductos.ok) setProductos(respuestaProductos.datos);
      if (respuestaPedidos.ok) setPedidos(respuestaPedidos.datos);
      if (respuestaCompanias.ok) setCompanias(respuestaCompanias.datos);
      setCargando(false);
    };
    cargar();
  }, [usuario.id]);

  const ventas = pedidos.reduce((suma, p) => suma + p.total, 0);
  const porPreparar = pedidos.filter((p) => p.estado === "En preparación").length;
  const activas = productos.filter((p) => p.estado === "Publicada").length;
  const borradores = productos.filter((p) => p.estado === "Borrador").length;
  const totalResenas = productos.reduce((suma, p) => suma + p.resenas, 0);
  const promedio = totalResenas
    ? productos.reduce((suma, p) => suma + p.calificacion * p.resenas, 0) / totalResenas
    : 0;
  const mes = new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  const tarjetas = [
    {
      icono: <PaymentsOutlinedIcon fontSize="small" />,
      titulo: "Ventas del mes",
      valor: formatearPrecio(ventas),
      detalle: plural(pedidos.length, "pedido", "pedidos"),
    },
    {
      icono: <PlaylistAddCheckOutlinedIcon fontSize="small" />,
      titulo: "Pedidos por preparar",
      valor: porPreparar,
      detalle: porPreparar ? "Revisa la tabla de pedidos" : "Todo al día",
    },
    {
      icono: <Inventory2OutlinedIcon fontSize="small" />,
      titulo: "Publicaciones activas",
      valor: activas,
      detalle: `De ${plural(productos.length, "publicación", "publicaciones")}`,
    },
    {
      icono: <StarOutlineIcon fontSize="small" />,
      titulo: "Calificación promedio",
      valor: promedio ? promedio.toLocaleString("es-CL", { maximumFractionDigits: 1 }) : "-",
      detalle: `De ${plural(totalResenas, "reseña", "reseñas")}`,
    },
  ];

  const alertas = [
    ...productos
      .filter((p) => p.tipo === "Producto" && p.estado !== "Borrador" && p.stock <= 3)
      .map((p) => ({
        aviso: true,
        texto: p.stock === 0 ? `Sin stock: ${p.nombre}.` : `Stock bajo: ${p.nombre} (${plural(p.stock, "unidad", "unidades")}).`,
      })),
    ...(borradores ? [{ texto: `Tienes ${plural(borradores, "publicación", "publicaciones")} en borrador.` }] : []),
    ...(porPreparar ? [{ texto: `Tienes ${plural(porPreparar, "pedido", "pedidos")} por preparar.` }] : []),
  ];

  return (
    <>
      <PageHeader
        titulo={`Hola, ${usuario.nombres.split(" ")[0]}`}
        subtitulo={`Resumen de ${nombreTienda(usuario, companias)} · ${mes}`}
        acciones={
          <CustomButton startIcon={<AddIcon />} onClick={() => navigate("/mi-tienda/publicaciones/nueva")}>
            Publicar producto
          </CustomButton>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tarjetas.map((tarjeta) => (
          <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...tarjeta} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Pedidos recientes
          </Typography>
          <OrderTable pedidos={pedidos.slice(0, 5)} cargando={cargando} />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Alertas y tareas
            </Typography>
            {alertas.length === 0 && <Typography>{cargando ? "Cargando..." : "No tienes tareas pendientes."}</Typography>}
            {alertas.map((alerta) => (
              <Box
                key={alerta.texto}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "text.primary",
                  borderRadius: 1,
                  p: 1.25,
                  mb: 1,
                }}
              >
                {alerta.aviso ? <WarningAmberOutlinedIcon fontSize="small" /> : <InfoOutlinedIcon fontSize="small" />}
                <Typography>{alerta.texto}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default StoreSummaryScreen;
