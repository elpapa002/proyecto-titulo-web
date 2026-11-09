import { useEffect, useState } from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import CheckoutSteps from "../../components/organisms/CheckoutSteps/CheckoutSteps";
import CheckoutShipping from "../../components/organisms/CheckoutShipping/CheckoutShipping";
import CheckoutPayment from "../../components/organisms/CheckoutPayment/CheckoutPayment";
import PurchaseSummary from "../../components/organisms/PurchaseSummary/PurchaseSummary";
import PurchaseReceipt from "../../components/organisms/PurchaseReceipt/PurchaseReceipt";
import Notice from "../../components/molecules/Notice/Notice";
import CustomButton from "../../components/atoms/Button/CustomButton";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerDirecciones } from "../../services/direccionService";
import { calcularEnvio } from "../../services/envioService";
import { crearVenta } from "../../services/ventaService";
import { formatearPrecio } from "../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };
const deshabilitado = { "&.Mui-disabled": { bgcolor: "primary.main", color: "secondary.main", opacity: 0.45 } };

const CheckoutScreen = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const { carro, vaciarCarro, recargarAvisos, esMovil } = useOutletContext();
  const [paso, setPaso] = useState(2);
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);
  const [direccionId, setDireccionId] = useState(null);
  const [envios, setEnvios] = useState({});
  const [pago, setPago] = useState({ tipo: "", marca: "", ultimos4: "", acepto: false });
  const [errores, setErrores] = useState({});
  const [errorPago, setErrorPago] = useState("");
  const [pagando, setPagando] = useState(false);
  const [venta, setVenta] = useState(null);
  const [aviso, setAviso] = useState("");

  const vendedorId = carro[0]?.vendedorId;
  const direccion = direcciones.find((d) => d.id === direccionId);
  const comuna = direccion?.comuna;
  const envio = comuna ? envios[comuna] : undefined;

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerDirecciones(usuario.id);
      if (respuesta.ok) {
        setDirecciones(respuesta.datos);
        const principal = respuesta.datos.find((d) => d.principal) ?? respuesta.datos[0];
        if (principal) setDireccionId(principal.id);
      } else {
        setAviso("No se pudieron cargar tus direcciones.");
      }
      setCargandoDirecciones(false);
    };
    cargar();
  }, [usuario.id]);

  useEffect(() => {
    if (!comuna || !vendedorId || envios[comuna]) return;
    const calcular = async () => {
      const respuesta = await calcularEnvio(vendedorId, comuna);
      setEnvios((actuales) => ({ ...actuales, [comuna]: respuesta }));
    };
    calcular();
  }, [comuna, vendedorId, envios]);

  const unidades = carro.reduce((suma, item) => suma + item.cantidad, 0);
  const subtotal = carro.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const costoEnvio = envio?.ok ? envio.datos.costo : 0;
  const total = subtotal + costoEnvio;
  const neto = Math.round(total / 1.19);
  const iva = total - neto;

  const cerrarAviso = (_, razon) => {
    if (razon !== "clickaway") setAviso("");
  };

  const irAPaso = (numero) => {
    setPaso(numero);
    window.scrollTo(0, 0);
  };

  const cambiarPago = (e) => {
    const { name, value, type, checked } = e.target;
    let valor = value;
    if (type === "checkbox") valor = checked;
    else if (name === "ultimos4") valor = value.replace(/\D/g, "").slice(0, 4);
    setPago({ ...pago, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const validarPago = () => {
    const e = {};
    if (!pago.tipo) e.tipo = "Elige el tipo de tarjeta.";
    if (!pago.marca) e.marca = "Elige la marca de la tarjeta.";
    else if (pago.marca === "Redcompra" && pago.tipo === "Crédito") e.marca = "Redcompra es solo para tarjetas de débito.";
    if (!/^\d{4}$/.test(pago.ultimos4)) e.ultimos4 = "Ingresa exactamente los 4 últimos números.";
    if (!pago.acepto) e.acepto = "Debes aceptar las condiciones para pagar.";
    return e;
  };

  const pagar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validarPago();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosVenta = {
      clienteId: usuario.id,
      vendedorId,
      items: carro.map((item) => ({
        productoId: item.productoId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      envio: costoEnvio,
      total,
      medioPago: { tipo: pago.tipo, marca: pago.marca, ultimos4: pago.ultimos4 },
      direccion: `${direccion.calle} ${direccion.numero}, ${direccion.comuna}`,
      comuna: direccion.comuna,
    };
    console.log("Datos de la compra:", datosVenta);

    setPagando(true);
    setErrorPago("");
    const respuesta = await crearVenta(datosVenta);
    setPagando(false);
    if (!respuesta.ok) {
      setErrorPago(respuesta.error);
      setAviso(respuesta.error);
      return;
    }
    setVenta(respuesta.datos);
    vaciarCarro();
    recargarAvisos();
    setAviso("Compra realizada");
    irAPaso(4);
  };

  if (venta) {
    return (
      <>
        <CheckoutSteps actual={4} esMovil={esMovil} />
        <PageHeader titulo="Compra confirmada" subtitulo="Guarda el número de venta por si necesitas hacer un reclamo." />
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ ...tarjeta, p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "primary.main",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                }}
              >
                <CheckIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h2" sx={{ mt: 2 }}>
                ¡Gracias por tu compra!
              </Typography>
              <Typography sx={{ mt: 1 }}>
                Tu pedido N° {venta.id} a {venta.tienda} quedó registrado en estado "{venta.estadoPedido}".
                {envio?.ok &&
                  ` Llega en ${envio.datos.dias === 1 ? "1 día hábil" : `${envio.datos.dias} días hábiles`} aprox.`}{" "}
                Te avisaremos cada vez que cambie de estado.
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <StatusChip texto={`Pedido ${venta.estadoPedido.toLowerCase()}`} relleno />
              </Box>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", mt: 3 }}>
                <CustomButton startIcon={<Inventory2OutlinedIcon />} onClick={() => navigate("/tienda/compras")}>
                  Ver mis compras
                </CustomButton>
                <CustomButton tono="contorno" onClick={() => navigate("/tienda")}>
                  Seguir comprando
                </CustomButton>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <PurchaseReceipt venta={venta} cliente={usuario} />
          </Grid>
        </Grid>
        <Notice mensaje={aviso} onClose={cerrarAviso} />
      </>
    );
  }

  if (carro.length === 0) {
    return (
      <>
        <PageHeader titulo="Compra" subtitulo="Despacho, pago y boleta de tu compra." />
        <Paper variant="outlined" sx={{ ...tarjeta, p: 4, textAlign: "center" }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" sx={{ mt: 1 }}>
            No tienes productos en el carro
          </Typography>
          <Typography sx={{ mt: 1, mb: 2 }}>Agrega productos desde la tienda para poder comprar.</Typography>
          <CustomButton onClick={() => navigate("/tienda")}>Ir a la tienda</CustomButton>
        </Paper>
        <Notice mensaje={aviso} onClose={cerrarAviso} />
      </>
    );
  }

  const tienda = carro[0].tienda;
  const filaProductos = { texto: `Productos (${unidades})`, valor: formatearPrecio(subtotal) };
  let valorEnvio = "Elige una dirección";
  if (direccion && !envio) valorEnvio = "Calculando...";
  if (envio?.ok) valorEnvio = formatearPrecio(costoEnvio);
  if (envio && !envio.ok) valorEnvio = "Sin despacho";
  const filaEnvio = { texto: comuna ? `Despacho a ${comuna}` : "Despacho", valor: valorEnvio };

  if (paso === 2) {
    return (
      <>
        <CheckoutSteps actual={2} esMovil={esMovil} />
        <PageHeader titulo="¿Cómo quieres recibir tu compra?" subtitulo={`Compra a ${tienda}. Elige dónde te la enviamos.`} />
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <CheckoutShipping
              direcciones={direcciones}
              cargando={cargandoDirecciones}
              direccionId={direccionId}
              onElegir={setDireccionId}
              envio={envio}
              tienda={tienda}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PurchaseSummary filas={[filaProductos, filaEnvio]} total={{ texto: "Total", valor: formatearPrecio(total) }}>
              <CustomButton fullWidth disabled={!envio?.ok} onClick={() => irAPaso(3)} sx={deshabilitado}>
                Continuar al pago
              </CustomButton>
              <CustomButton tono="contorno" fullWidth onClick={() => navigate("/tienda/carro")}>
                Volver al carro
              </CustomButton>
              {!envio?.ok && (
                <Typography variant="body2">Para continuar elige una dirección donde este emprendedor despache.</Typography>
              )}
            </PurchaseSummary>
          </Grid>
        </Grid>
        <Notice mensaje={aviso} onClose={cerrarAviso} />
      </>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={pagar}>
      <CheckoutSteps actual={3} esMovil={esMovil} />
      <PageHeader titulo="Pago" subtitulo={`Compra a ${tienda} con despacho a ${direccion.calle} ${direccion.numero}, ${direccion.comuna}.`} />
      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {errorPago && (
              <Box
                role="alert"
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  p: 1.25,
                }}
              >
                <WarningAmberOutlinedIcon fontSize="small" />
                <Typography>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    No se pudo completar el pago. {errorPago}
                  </Box>{" "}
                  Vuelve al carro y ajusta las cantidades.
                </Typography>
              </Box>
            )}
            <CheckoutPayment datos={pago} errores={errores} onCambiar={cambiarPago} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PurchaseSummary
            filas={[
              filaProductos,
              filaEnvio,
              { texto: "Valor neto (sin IVA)", valor: formatearPrecio(neto) },
              { texto: "IVA (19%)", valor: formatearPrecio(iva) },
            ]}
            total={{ texto: "Total a pagar", valor: formatearPrecio(total) }}
          >
            <CustomButton type="submit" fullWidth startIcon={<LockOutlinedIcon />} disabled={pagando}>
              {pagando ? "Procesando pago..." : `Pagar ${formatearPrecio(total)}`}
            </CustomButton>
            <CustomButton tono="contorno" fullWidth onClick={() => irAPaso(2)} disabled={pagando}>
              Volver al despacho
            </CustomButton>
            <Typography variant="body2">
              Los precios ya incluyen IVA. El total es la suma de los productos más el envío.
            </Typography>
          </PurchaseSummary>
        </Grid>
      </Grid>
      <Notice mensaje={aviso} onClose={cerrarAviso} />
    </Box>
  );
};

export default CheckoutScreen;
