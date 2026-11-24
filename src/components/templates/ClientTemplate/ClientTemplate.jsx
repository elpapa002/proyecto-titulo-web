import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../organisms/ClientHeader/ClientHeader";
import BottomBar from "../../organisms/BottomBar/BottomBar";
import useUser from "../../../contexts/UserContext/useUser";
import useMediaQuery from "../../../hooks/useMediaQuery/useMediaQuery";
import { obtenerNotificaciones } from "../../../services/notificacionService";
import { claveItem, escribirGuardado, leerGuardado } from "../../../utils/guardado";
import "../../../styles/Tienda.css";

const ClientTemplate = () => {
  const { usuario } = useUser();
  const { esMovil } = useMediaQuery();
  const { pathname } = useLocation();
  const [favoritos, setFavoritos] = useState(() => leerGuardado("deseos", usuario.id));
  const [carro, setCarro] = useState(() =>
    leerGuardado("carro", usuario.id).map((item) => ({ ...item, clave: item.clave ?? claveItem(item.productoId, item.varianteId) }))
  );
  const [avisosSinLeer, setAvisosSinLeer] = useState(0);
  const [recargas, setRecargas] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerNotificaciones(usuario.id);
      if (respuesta.ok) setAvisosSinLeer(respuesta.datos.filter((n) => !n.leida).length);
    };
    cargar();
  }, [usuario.id, pathname, recargas]);

  useEffect(() => escribirGuardado("deseos", usuario.id, favoritos), [usuario.id, favoritos]);
  useEffect(() => escribirGuardado("carro", usuario.id, carro), [usuario.id, carro]);

  const alternarFavorito = (id) => {
    setFavoritos((actuales) => (actuales.includes(id) ? actuales.filter((f) => f !== id) : [...actuales, id]));
  };

  // variante es la talla o color elegido en la ficha (null si el producto no tiene variantes)
  const agregarAlCarro = (producto, cantidad, variante = null) => {
    if (producto.vendedorId === usuario.id) return "No puedes comprar tus propias publicaciones.";
    if (carro.length > 0 && carro[0].vendedorId !== producto.vendedorId) {
      return `Tu carro tiene productos de ${carro[0].tienda}. Cada compra es de un solo emprendedor, termina esa compra o vacía el carro.`;
    }
    const clave = claveItem(producto.id, variante?.id);
    const stock = variante ? variante.stock : producto.stock;
    const enCarro = carro.find((item) => item.clave === clave)?.cantidad ?? 0;
    if (enCarro + cantidad > stock) {
      return `Solo quedan ${stock} ${producto.tipo === "Servicio" ? "cupos" : "unidades"} disponibles.`;
    }
    if (enCarro > 0) {
      setCarro(carro.map((item) => (item.clave === clave ? { ...item, cantidad: enCarro + cantidad } : item)));
    } else {
      setCarro([
        ...carro,
        {
          clave,
          productoId: producto.id,
          varianteId: variante?.id ?? null,
          variante: variante ? [variante.talla && `Talla ${variante.talla}`, variante.color].filter(Boolean).join(" · ") : "",
          nombre: producto.nombre,
          tipo: producto.tipo,
          precio: variante ? (variante.precioOferta ?? variante.precio) : (producto.precioOferta ?? producto.precio),
          peso: producto.peso ?? "",
          fotoUrl: producto.fotos?.[0]?.url ?? null,
          cantidad,
          stock,
          vendedorId: producto.vendedorId,
          tienda: producto.tienda,
        },
      ]);
    }
    return "";
  };

  const cambiarCantidad = (clave, cantidad) => {
    setCarro(carro.map((item) => (item.clave === clave ? { ...item, cantidad } : item)));
  };

  const quitarDelCarro = (clave) => setCarro(carro.filter((item) => item.clave !== clave));

  const vaciarCarro = () => setCarro([]);

  const contexto = {
    esMovil,
    enTienda: true,
    favoritos,
    alternarFavorito,
    carro,
    agregarAlCarro,
    cambiarCantidad,
    quitarDelCarro,
    vaciarCarro,
    recargarAvisos: () => setRecargas((n) => n + 1),
  };

  const cantidadCarro = carro.reduce((suma, item) => suma + item.cantidad, 0);

  return (
    <Box className="tienda">
      <ClientHeader cantidadDeseos={favoritos.length} cantidadCarro={cantidadCarro} avisosSinLeer={avisosSinLeer} />
      <Box component="main" className="tienda-contenido" sx={{ pb: esMovil ? 12 : undefined }}>
        <Outlet context={contexto} />
      </Box>
      {esMovil && <BottomBar cantidadCarro={cantidadCarro} avisosSinLeer={avisosSinLeer} />}
    </Box>
  );
};

export default ClientTemplate;
