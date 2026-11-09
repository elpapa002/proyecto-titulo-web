import { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import ShippingTable from "../../components/organisms/ShippingTable/ShippingTable";
import ShippingFormDialog from "../../components/organisms/ShippingFormDialog/ShippingFormDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import StatCard from "../../components/molecules/StatCard/StatCard";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import {
  actualizarCostoEnvio,
  crearCostoEnvio,
  eliminarCostoEnvio,
  obtenerCostosEnvio,
} from "../../services/envioService";
import { comunas } from "../../services/datosPrueba";
import { formatearPrecio } from "../../utils/formato";

const unirNombres = (nombres) =>
  nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}` : nombres[0];

const ShippingCostsScreen = () => {
  const { usuario } = useUser();
  const [costos, setCostos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCostosEnvio(usuario.id);
      if (respuesta.ok) setCostos(respuesta.datos);
      else setAviso("No se pudieron cargar tus costos de envío.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id, recargas]);

  const valores = costos.map((c) => c.costo);
  const promedio = costos.length ? Math.round(valores.reduce((suma, v) => suma + v, 0) / costos.length) : 0;
  const gratis = valores.filter((v) => v === 0).length;
  const menosDias = costos.length ? Math.min(...costos.map((c) => c.dias)) : 0;
  const masRapidas = costos.filter((c) => c.dias === menosDias).map((c) => c.comuna);

  const tarjetas = [
    {
      icono: <PlaceOutlinedIcon fontSize="small" />,
      titulo: "Comunas con despacho",
      valor: costos.length,
      detalle: `De ${comunas.length} comunas disponibles`,
    },
    {
      icono: <PaymentsOutlinedIcon fontSize="small" />,
      titulo: "Costo promedio",
      valor: costos.length ? formatearPrecio(promedio) : "-",
      detalle: costos.length
        ? gratis
          ? `${gratis} ${gratis === 1 ? "comuna" : "comunas"} con envío gratis`
          : `Entre ${formatearPrecio(Math.min(...valores))} y ${formatearPrecio(Math.max(...valores))}`
        : "Sin comunas todavía",
    },
    {
      icono: <LocalShippingOutlinedIcon fontSize="small" />,
      titulo: "Despacho más rápido",
      valor: costos.length ? `${menosDias} ${menosDias === 1 ? "día" : "días"}` : "-",
      detalle: costos.length ? `A ${unirNombres(masRapidas)}` : "Sin comunas todavía",
    },
  ];

  const guardar = async (datos) => {
    const original = formulario.costo;
    const datosEnvio = { vendedorId: usuario.id, ...datos };
    console.log(original ? "Datos para actualizar costo de envío:" : "Datos para crear costo de envío:", datosEnvio);
    const respuesta = original
      ? await actualizarCostoEnvio(original.id, datosEnvio)
      : await crearCostoEnvio(datosEnvio);
    if (!respuesta.ok) return respuesta.error;

    setAviso(original ? "Costo de envío actualizado" : `${datos.comuna} agregada a tus despachos`);
    setFormulario(null);
    setRecargas((n) => n + 1);
    return "";
  };

  const confirmarBorrado = async () => {
    const costo = aBorrar;
    const respuesta = await eliminarCostoEnvio(costo.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso("No se pudo eliminar. Intenta de nuevo.");
      return;
    }
    console.log("Costo de envío eliminado:", { id: costo.id, comuna: costo.comuna });
    setAviso(`${costo.comuna} eliminada de tus despachos`);
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader
        titulo="Costos de envío"
        subtitulo="Define cuánto cobras por despacho a cada comuna y en cuántos días llega."
        acciones={
          <CustomButton startIcon={<AddIcon />} onClick={() => setFormulario({ costo: null })}>
            Agregar comuna
          </CustomButton>
        }
      />

      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 1.5, borderColor: "text.primary", display: "flex", gap: 1.5, alignItems: "flex-start", mb: 3 }}
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mt: 0.25 }} />
        <Typography>
          Los clientes de comunas que no estén en la lista no podrán comprarte. Si no cobras el despacho a una
          comuna, deja el costo en $0 y se mostrará como gratis.
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tarjetas.map((tarjeta) => (
          <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 4 }}>
            <StatCard {...tarjeta} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h3" sx={{ mb: 1.5 }}>
        Comunas de despacho
      </Typography>
      <ShippingTable
        costos={costos}
        cargando={cargando}
        onEditar={(costo) => setFormulario({ costo })}
        onEliminar={setABorrar}
      />

      {formulario && (
        <ShippingFormDialog
          costo={formulario.costo}
          costos={costos}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar comuna?"
        mensaje={
          aBorrar
            ? `Vas a quitar ${aBorrar.comuna} de tus despachos. Los clientes de esa comuna ya no podrán comprarte.`
            : ""
        }
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default ShippingCostsScreen;
