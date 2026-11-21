import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutlineOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import SalesChart from "../../components/organisms/SalesChart/SalesChart";
import RatingSummary from "../../components/organisms/RatingSummary/RatingSummary";
import RankingTable from "../../components/organisms/RankingTable/RankingTable";
import PeriodFilter from "../../components/molecules/PeriodFilter/PeriodFilter";
import StatCard from "../../components/molecules/StatCard/StatCard";
import Notice from "../../components/molecules/Notice/Notice";
import CustomButton from "../../components/atoms/Button/CustomButton";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerReporteVendedor } from "../../services/reporteService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";
import { erroresPeriodo, rangoPeriodo } from "../../utils/periodo";
import { descargarReporteVendedor } from "../../utils/pdf";

const PERIODO_INICIAL = "semestre";

const ReportsScreen = () => {
  const { usuario } = useUser();
  const [periodo, setPeriodo] = useState(PERIODO_INICIAL);
  const [fechas, setFechas] = useState(() => rangoPeriodo(PERIODO_INICIAL));
  const [consulta, setConsulta] = useState(() => rangoPeriodo(PERIODO_INICIAL));
  const [errores, setErrores] = useState({});
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const respuesta = await obtenerReporteVendedor(usuario.id, consulta.desde, consulta.hasta);
      if (respuesta.ok) setReporte(respuesta.datos);
      else setAviso(respuesta.error ?? "No se pudo cargar el reporte.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, consulta]);

  const aplicar = (nuevas) => {
    setFechas(nuevas);
    const e = erroresPeriodo(nuevas);
    setErrores(e);
    if (Object.keys(e).length === 0) setConsulta(nuevas);
  };

  const elegirPeriodo = (valor) => {
    setPeriodo(valor);
    aplicar(rangoPeriodo(valor));
  };

  const cambiarFecha = (e) => {
    setPeriodo("");
    aplicar({ ...fechas, [e.target.name]: e.target.value });
  };

  const descargar = async () => {
    console.log("Reporte descargado:", { vendedorId: usuario.id, desde: reporte.desde, hasta: reporte.hasta });
    setDescargando(true);
    try {
      await descargarReporteVendedor(reporte);
    } catch {
      setAviso("No se pudo generar el PDF.");
    }
    setDescargando(false);
  };

  const tarjetas = reporte
    ? [
        {
          icono: <PaymentsOutlinedIcon fontSize="small" />,
          titulo: "Ventas del período",
          valor: formatearPrecio(reporte.totalVentas),
          detalle: "IVA incluido",
        },
        {
          icono: <Inventory2OutlinedIcon fontSize="small" />,
          titulo: "Pedidos",
          valor: reporte.pedidos,
          detalle: `${reporte.cancelados} ${reporte.cancelados === 1 ? "cancelado" : "cancelados"}`,
        },
        {
          icono: <BarChartOutlinedIcon fontSize="small" />,
          titulo: "Venta promedio",
          valor: formatearPrecio(reporte.ventaPromedio),
          detalle: "Por pedido",
        },
        {
          icono: <StarOutlineIcon fontSize="small" />,
          titulo: "Calificación promedio",
          valor: reporte.resenas ? String(reporte.calificacionPromedio).replace(".", ",") : "-",
          detalle: `De ${reporte.resenas} ${reporte.resenas === 1 ? "reseña" : "reseñas"}`,
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        titulo="Reportes de ventas"
        subtitulo="Ventas por período, productos más vendidos y calificación promedio."
        acciones={
          <CustomButton
            tono="contorno"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={descargar}
            disabled={!reporte || cargando || descargando}
          >
            {descargando ? "Generando..." : "Descargar reporte"}
          </CustomButton>
        }
      />

      <PeriodFilter
        desde={fechas.desde}
        hasta={fechas.hasta}
        periodo={periodo}
        errores={errores}
        onElegirPeriodo={elegirPeriodo}
        onCambiarFecha={cambiarFecha}
      />

      {!reporte && <Typography>{cargando ? "Cargando reporte..." : "No hay datos para mostrar."}</Typography>}

      {reporte && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {tarjetas.map((tarjeta) => (
              <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard {...tarjeta} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ alignItems: "flex-start", mb: 3 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SalesChart
                titulo="Ventas por mes"
                datos={reporte.ventasPorMes}
                nota={`Del ${formatearFecha(reporte.desde)} al ${formatearFecha(reporte.hasta)}. No considera ventas canceladas.`}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <RatingSummary
                promedio={reporte.calificacionPromedio}
                resenas={reporte.resenas}
                calificaciones={reporte.calificaciones}
              />
            </Grid>
          </Grid>

          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Productos más vendidos
          </Typography>
          <RankingTable
            columnas={["Lugar", "Producto", "Unidades", "Total vendido"]}
            filas={reporte.productosMasVendidos.map((p) => [p.lugar, p.nombre, p.unidades, formatearPrecio(p.total)])}
            vacio="No hubo ventas en este período."
          />
        </>
      )}

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default ReportsScreen;
