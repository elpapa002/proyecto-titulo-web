import { llamarApi } from "./api";
import { memoria } from "./datosPrueba";
import { agregarNotificacion } from "./notificacionService";
import { nombreTiendaDe } from "./productService";
import { hoyIso } from "../utils/formato";

const nombreCliente = (clienteId) => {
  const cliente = memoria.usuarios.find((u) => u.id === clienteId);
  return cliente ? `${cliente.nombres.split(" ")[0]} ${cliente.apellidos.split(" ")[0]}` : "Cliente";
};

const completar = (venta) => ({
  ...venta,
  cliente: nombreCliente(venta.clienteId),
  tienda: nombreTiendaDe(venta.vendedorId),
});

export const obtenerMisCompras = (clienteId) =>
  llamarApi(`/clientes/${clienteId}/compras`, "GET", null, () =>
    memoria.ventas.filter((v) => v.clienteId === clienteId).map(completar)
  );

export const obtenerMisVentas = (vendedorId) =>
  llamarApi(`/vendedores/${vendedorId}/ventas`, "GET", null, () =>
    memoria.ventas.filter((v) => v.vendedorId === vendedorId).map(completar)
  );

export const obtenerVenta = (id) =>
  llamarApi(`/ventas/${id}`, "GET", null, () => {
    const venta = memoria.ventas.find((v) => v.id === id);
    if (!venta) throw new Error("No existe la venta.");
    return completar(venta);
  });

export const crearVenta = (datos) =>
  llamarApi("/ventas", "POST", datos, () => {
    datos.items.forEach((item) => {
      const producto = memoria.productos.find((p) => p.id === item.productoId);
      if (!producto || producto.stock < item.cantidad) throw new Error(`No hay stock suficiente de ${item.nombre}.`);
    });
    memoria.productos = memoria.productos.map((p) => {
      const item = datos.items.find((i) => i.productoId === p.id);
      return item ? { ...p, stock: p.stock - item.cantidad } : p;
    });
    const nueva = {
      ...datos,
      id: Math.max(...memoria.ventas.map((v) => v.id)) + 1,
      fecha: hoyIso(),
      estadoTransaccion: "Completada",
      estadoPedido: "Pagado",
      empresaTransporte: "",
      seguimiento: "",
      calificada: false,
    };
    memoria.ventas = [nueva, ...memoria.ventas];
    agregarNotificacion(nueva.vendedorId, `Tienes una venta nueva, la ${nueva.id}.`, `/mi-tienda/ventas/${nueva.id}`);
    return completar(nueva);
  });

export const actualizarPedido = (id, datos) =>
  llamarApi(`/ventas/${id}`, "PUT", datos, () => {
    memoria.ventas = memoria.ventas.map((v) => (v.id === id ? { ...v, ...datos } : v));
    const venta = memoria.ventas.find((v) => v.id === id);
    agregarNotificacion(venta.clienteId, `Tu pedido ${id} cambió a "${venta.estadoPedido}".`, `/tienda/compras/${id}`);
    return completar(venta);
  });
