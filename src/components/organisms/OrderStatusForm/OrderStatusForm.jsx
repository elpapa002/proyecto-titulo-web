import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import StepIndicator from "../../molecules/StepIndicator/StepIndicator";

const ORDEN = ["Pagado", "En preparación", "Enviado", "Entregado"];
const EMPRESAS = ["Starken", "Chilexpress", "Correos de Chile", "Blue Express", "Despacho propio"];
const conDespacho = (estado) => estado === "Enviado" || estado === "Entregado";

const OrderStatusForm = ({ venta, onGuardar }) => {
  const actual = venta.estadoPedido;
  const bloqueado = actual === "Entregado" || actual === "Cancelado";
  const [datos, setDatos] = useState({
    estadoPedido: actual,
    empresaTransporte: venta.empresaTransporte ?? "",
    seguimiento: venta.seguimiento ?? "",
  });
  const [errores, setErrores] = useState({});
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const opciones = bloqueado
    ? [actual]
    : [...ORDEN.slice(ORDEN.indexOf(actual)), "Cancelado"];
  const pideDespacho = conDespacho(datos.estadoPedido);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: name === "seguimiento" ? value.toUpperCase() : value });
    setErrores({ ...errores, [name]: undefined });
  };

  const validar = () => {
    const e = {};
    const nuevo = datos.estadoPedido;
    const sinCambios =
      nuevo === actual &&
      datos.empresaTransporte === (venta.empresaTransporte ?? "") &&
      datos.seguimiento.trim() === (venta.seguimiento ?? "");
    if (!nuevo) e.estadoPedido = "Elige el estado del pedido.";
    else if (nuevo !== "Cancelado" && ORDEN.indexOf(nuevo) < ORDEN.indexOf(actual))
      e.estadoPedido = "No puedes volver a un estado anterior.";
    else if (sinCambios) e.estadoPedido = "No hay cambios para guardar.";
    if (conDespacho(nuevo)) {
      const seguimiento = datos.seguimiento.trim();
      if (!datos.empresaTransporte) e.empresaTransporte = "Elige la empresa de transporte.";
      if (!seguimiento) e.seguimiento = "Ingresa el número de seguimiento.";
      else if (!/^[A-Z0-9-]{5,30}$/.test(seguimiento))
        e.seguimiento = "Usa de 5 a 30 caracteres, solo letras, números y guion.";
    }
    return e;
  };

  const guardar = async () => {
    const datosPedido = {
      estadoPedido: datos.estadoPedido,
      estadoTransaccion: datos.estadoPedido === "Cancelado" ? "Cancelada" : "Completada",
      empresaTransporte: pideDespacho ? datos.empresaTransporte : "",
      seguimiento: pideDespacho ? datos.seguimiento.trim() : "",
    };
    console.log("Datos para actualizar pedido:", { id: venta.id, ...datosPedido });
    setConfirmando(false);
    setGuardando(true);
    await onGuardar(datosPedido);
    setGuardando(false);
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    if (datos.estadoPedido === "Cancelado") {
      setConfirmando(true);
      return;
    }
    guardar();
  };

  const pasoActual = actual === "Entregado" ? ORDEN.length + 1 : ORDEN.indexOf(actual) + 1;

  return (
    <Paper
      variant="outlined"
      component="form"
      noValidate
      onSubmit={enviar}
      sx={{ p: 2.5, borderRadius: 1.5, borderColor: "text.primary" }}
    >
      <Typography variant="h3">Estado del pedido y despacho</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, mb: 2.5 }}>
        Los campos marcados con * son obligatorios.
      </Typography>

      {actual === "Cancelado" ? (
        <Typography sx={{ fontWeight: 600, mb: 2.5 }}>Este pedido fue cancelado.</Typography>
      ) : (
        <>
          <Box sx={{ mb: 3, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
            <StepIndicator pasos={ORDEN} actual={pasoActual} />
          </Box>
          <Typography sx={{ mb: 2.5, display: { xs: "block", md: "none" } }}>
            Avance: <strong>{actual}</strong> (paso {ORDEN.indexOf(actual) + 1} de {ORDEN.length})
          </Typography>
        </>
      )}

      {bloqueado && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
            border: "1px solid",
            borderColor: "text.primary",
            borderRadius: 1,
            p: 1.25,
            mb: 2.5,
          }}
        >
          <LockOutlinedIcon fontSize="small" />
          <Typography>
            {actual === "Entregado"
              ? "El pedido ya fue entregado al cliente, por eso no se puede modificar."
              : "El pedido está cancelado y la venta quedó anulada, por eso no se puede modificar."}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: pideDespacho ? 4 : 6 }}>
          <SelectField
            label="Estado del pedido"
            name="estadoPedido"
            required
            value={datos.estadoPedido}
            onChange={cambiar}
            disabled={bloqueado}
            opciones={opciones.map((estado) => ({ valor: estado, texto: estado === actual ? `${estado} (actual)` : estado }))}
            error={Boolean(errores.estadoPedido)}
            helperText={errores.estadoPedido}
          />
        </Grid>
        {pideDespacho && (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SelectField
                label="Empresa de transporte"
                name="empresaTransporte"
                required
                value={datos.empresaTransporte}
                onChange={cambiar}
                disabled={bloqueado}
                opciones={EMPRESAS.map((empresa) => ({ valor: empresa, texto: empresa }))}
                error={Boolean(errores.empresaTransporte)}
                helperText={errores.empresaTransporte}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                label="N° de seguimiento"
                name="seguimiento"
                required
                placeholder="STK-889120"
                value={datos.seguimiento}
                onChange={cambiar}
                disabled={bloqueado}
                slotProps={{ htmlInput: { maxLength: 30 } }}
                error={Boolean(errores.seguimiento)}
                helperText={errores.seguimiento ?? "De 5 a 30 caracteres"}
              />
            </Grid>
          </>
        )}
      </Grid>

      {!bloqueado && (
        <>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              border: "1px solid",
              borderColor: "text.primary",
              borderRadius: 1,
              p: 1.25,
              mt: 2.5,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
            <Typography>
              El pedido avanza en este orden: Pagado, En preparación, Enviado y Entregado. No se puede volver a un estado
              anterior y al cliente le llega un aviso con cada cambio.
            </Typography>
          </Box>
          <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando} sx={{ mt: 2.5 }}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </CustomButton>
        </>
      )}

      <Dialog open={confirmando} onClose={() => setConfirmando(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "primary.main", pb: 1 }}>¿Cancelar el pedido?</DialogTitle>
        <DialogContent>
          <Typography>
            El pedido N° {venta.id} quedará cancelado y la venta pasará a "Cancelada". Después no se puede cambiar.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <CustomButton tono="contorno" onClick={() => setConfirmando(false)}>
            Volver
          </CustomButton>
          <CustomButton onClick={guardar}>Sí, cancelar pedido</CustomButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderStatusForm;
