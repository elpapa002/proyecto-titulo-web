import { useEffect, useState } from "react";
import { Box, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import SalesChart from "../../components/organisms/SalesChart/SalesChart";
import StatCard from "../../components/molecules/StatCard/StatCard";
import { obtenerUsuarios } from "../../services/userService";
import { alertas, indicadores, ventasPorMes } from "../../services/datosPrueba";

const iconos = [
  <PaymentsOutlinedIcon key="ventas" fontSize="small" />,
  <BarChartOutlinedIcon key="promedio" fontSize="small" />,
  <GroupOutlinedIcon key="usuarios" fontSize="small" />,
  <StorefrontOutlinedIcon key="emprendedores" fontSize="small" />,
];

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const SummaryScreen = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerUsuarios();
      if (respuesta.ok) setUsuarios(respuesta.datos);
    };
    cargar();
  }, []);

  const porRol = [
    { texto: "Clientes", cantidad: usuarios.filter((u) => u.roles.includes("Cliente")).length },
    { texto: "Emprendedores", cantidad: usuarios.filter((u) => u.roles.includes("Vendedor")).length },
    { texto: "Administradores", cantidad: usuarios.filter((u) => u.roles.includes("Admin")).length },
  ];

  return (
    <>
      <PageHeader
        titulo="Resumen de la plataforma"
        subtitulo="Actividad de Compra y Venta entre abril y septiembre de 2026."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {indicadores.map((indicador, i) => (
          <Grid key={indicador.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard icono={iconos[i]} {...indicador} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SalesChart datos={ventasPorMes} />
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
                    value={usuarios.length ? (fila.cantidad / usuarios.length) * 100 : 0}
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
              {alertas.map((alerta) => (
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
  );
};

export default SummaryScreen;
