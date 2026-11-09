import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import SalesTable from "../../components/organisms/SalesTable/SalesTable";
import StatCard from "../../components/molecules/StatCard/StatCard";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerMisVentas } from "../../services/ventaService";
import { formatearPrecio } from "../../utils/formato";

const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`;

const SalesScreen = () => {
  const { usuario } = useUser();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerMisVentas(usuario.id);
      if (respuesta.ok) setVentas([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id));
      else setAviso("No se pudieron cargar tus ventas.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id]);

  const completadas = ventas.filter((v) => v.estadoTransaccion === "Completada");
  const montoCompletadas = completadas.reduce((suma, v) => suma + v.total, 0);
  const porPreparar = ventas.filter((v) => v.estadoPedido === "Pagado" || v.estadoPedido === "En preparación").length;
  const enviados = ventas.filter((v) => v.estadoPedido === "Enviado").length;
  const cancelados = ventas.filter((v) => v.estadoPedido === "Cancelado").length;

  const tarjetas = [
    {
      icono: <PaymentsOutlinedIcon fontSize="small" />,
      titulo: "Ventas completadas",
      valor: formatearPrecio(montoCompletadas),
      detalle: plural(completadas.length, "venta", "ventas"),
    },
    {
      icono: <PlaylistAddCheckOutlinedIcon fontSize="small" />,
      titulo: "Pedidos por preparar",
      valor: porPreparar,
      detalle: porPreparar ? "Pagados o en preparación" : "Todo al día",
    },
    {
      icono: <LocalShippingOutlinedIcon fontSize="small" />,
      titulo: "Enviados",
      valor: enviados,
      detalle: "En camino al cliente",
    },
    {
      icono: <BlockOutlinedIcon fontSize="small" />,
      titulo: "Cancelados",
      valor: cancelados,
      detalle: `De ${plural(ventas.length, "pedido", "pedidos")}`,
    },
  ];

  return (
    <>
      <PageHeader titulo="Ventas y pedidos" subtitulo="Todas tus ventas con su estado de pago y el estado de cada pedido." />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tarjetas.map((tarjeta) => (
          <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...tarjeta} />
          </Grid>
        ))}
      </Grid>

      <SalesTable ventas={ventas} cargando={cargando} />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default SalesScreen;
