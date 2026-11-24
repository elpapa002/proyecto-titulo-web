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
      const variante = producto?.variantes?.find((v) => v.id === item.varianteId);
      const disponible = variante ? variante.stock : producto?.stock;
      if (!producto || disponible < item.cantidad) throw new Error(`No hay stock suficiente de ${item.nombre}.`);
    });
    // descuenta el stock del producto y, si se eligio talla o color, el de esa variante
    memoria.productos = memoria.productos.map((p) => {
      const items = datos.items.filter((i) => i.productoId === p.id);
      if (items.length === 0) return p;
      const variantes = (p.variantes ?? []).map((v) => {
        const item = items.find((i) => i.varianteId === v.id);
        return item ? { ...v, stock: v.stock - item.cantidad } : v;
      });
      return { ...p, variantes, stock: p.stock - items.reduce((suma, i) => suma + i.cantidad, 0) };
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
