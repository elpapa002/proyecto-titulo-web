import { useEffect, useState } from "react";
import { Box, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import SalesChart from "../../components/organisms/SalesChart/SalesChart";
import RankingTable from "../../components/organisms/RankingTable/RankingTable";
import PeriodFilter from "../../components/molecules/PeriodFilter/PeriodFilter";
import StatCard from "../../components/molecules/StatCard/StatCard";
import Notice from "../../components/molecules/Notice/Notice";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { obtenerReportePlataforma } from "../../services/reporteService";
import { formatearFecha, formatearPrecio } from "../../utils/formato";
import { erroresPeriodo, rangoPeriodo } from "../../utils/periodo";
import { descargarReportePlataforma } from "../../utils/pdf";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };
const PERIODO_INICIAL = "semestre";

const SummaryScreen = () => {
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
      const respuesta = await obtenerReportePlataforma(consulta.desde, consulta.hasta);
      if (respuesta.ok) setReporte(respuesta.datos);
      else setAviso(respuesta.error ?? "No se pudo cargar el resumen.");
      setCargando(false);
    };
    cargar();
  }, [consulta]);

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
    console.log("Reporte de la plataforma descargado:", { desde: reporte.desde, hasta: reporte.hasta });
    setDescargando(true);
    try {
      await descargarReportePlataforma(reporte);
    } catch {
      setAviso("No se pudo generar el PDF.");
    }
    setDescargando(false);
  };

  const indicadores = reporte
    ? [
        {
          icono: <PaymentsOutlinedIcon fontSize="small" />,
          titulo: "Ventas totales del período",
          valor: formatearPrecio(reporte.totalVentas),
          detalle: `${reporte.pedidos} ${reporte.pedidos === 1 ? "pedido" : "pedidos"}, IVA incluido`,
        },
        {
          icono: <BarChartOutlinedIcon fontSize="small" />,
          titulo: "Venta promedio",
          valor: formatearPrecio(reporte.ventaPromedio),
          detalle: "Por pedido",
        },
        {
          icono: <GroupOutlinedIcon fontSize="small" />,
          titulo: "Usuarios registrados",
          valor: reporte.usuarios,
          detalle: `${reporte.usuariosNuevos} ${reporte.usuariosNuevos === 1 ? "nuevo" : "nuevos"} en el período`,
        },
        {
          icono: <StorefrontOutlinedIcon fontSize="small" />,
          titulo: "Emprendedores con ventas",
          valor: reporte.emprendedoresConVentas,
          detalle: `De ${reporte.emprendedores} emprendedores registrados`,
        },
      ]
    : [];

  const porRol = reporte
    ? [
        { texto: "Clientes", cantidad: reporte.clientes },
        { texto: "Emprendedores", cantidad: reporte.emprendedores },
        { texto: "Administradores", cantidad: reporte.administradores },
      ]
    : [];

  return (
    <>
      <PageHeader
        titulo="Resumen de la plataforma"
        subtitulo={
          reporte
            ? `Actividad de Compra y Venta del ${formatearFecha(reporte.desde)} al ${formatearFecha(reporte.hasta)}.`
            : "Actividad de Compra y Venta."
        }
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

      {!reporte && <Typography>{cargando ? "Cargando resumen..." : "No hay datos para mostrar."}</Typography>}

      {reporte && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {indicadores.map((indicador) => (
              <Grid key={indicador.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard {...indicador} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack spacing={2}>
                <SalesChart titulo="Ventas por mes de toda la plataforma" datos={reporte.ventasPorMes} />
                <Box>
                  <Typography variant="h3" sx={{ mb: 1.5 }}>
                    Tiendas con más ventas
                  </Typography>
                  <RankingTable
                    columnas={["Lugar", "Tienda", "Pedidos", "Total vendido"]}
                    filas={reporte.tiendasMasVendedoras.map((t) => [t.lugar, t.tienda, t.pedidos, formatearPrecio(t.total)])}
                    vacio="No hubo ventas en este período."
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={tarjeta}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    Usuarios por rol
                  </Typography>
                  {porRol.map((fila) => (
                    <Box
                      key={fila.texto}
                      sx={{ display: "grid", gridTemplateColumns: "120px 1fr 32px", alignItems: "center", gap: 1.5, mb: 1.5 }}
                    >
                      <Typography>{fila.texto}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={reporte.usuarios ? (fila.cantidad / reporte.usuarios) * 100 : 0}
                        aria-label={fila.texto}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: "secondary.main",
                          border: "1px solid",
                          borderColor: "primary.main",
                        }}
                      />
                      <Typography sx={{ fontWeight: 600, textAlign: "right" }}>{fila.cantidad}</Typography>
                    </Box>
                  ))}
                  <Typography variant="body2">Una persona puede ser cliente y emprendedor a la vez.</Typography>
                </Paper>

                <Paper variant="outlined" sx={tarjeta}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    Alertas y tareas
                  </Typography>
                  {reporte.alertas.length === 0 && <Typography>No hay tareas pendientes.</Typography>}
                  {reporte.alertas.map((alerta) => (
                    <Box
                      key={alerta}
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
                      <InfoOutlinedIcon fontSize="small" />
                      <Typography>{alerta}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default SummaryScreen;
