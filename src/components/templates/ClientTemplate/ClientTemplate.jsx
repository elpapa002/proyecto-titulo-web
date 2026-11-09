import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "../../organisms/ClientHeader/ClientHeader";
import BottomBar from "../../organisms/BottomBar/BottomBar";
import useUser from "../../../contexts/UserContext/useUser";
import useMediaQuery from "../../../hooks/useMediaQuery/useMediaQuery";
import { obtenerNotificaciones } from "../../../services/notificacionService";
import "../../../styles/Tienda.css";

const ClientTemplate = () => {
  const { usuario } = useUser();
  const { esMovil } = useMediaQuery();
  const { pathname } = useLocation();
  const [favoritos, setFavoritos] = useState([]);
  const [carro, setCarro] = useState([]);
  const [avisosSinLeer, setAvisosSinLeer] = useState(0);
  const [recargas, setRecargas] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerNotificaciones(usuario.id);
      if (respuesta.ok) setAvisosSinLeer(respuesta.datos.filter((n) => !n.leida).length);
    };
    cargar();
  }, [usuario.id, pathname, recargas]);

  const alternarFavorito = (id) => {
    setFavoritos((actuales) => (actuales.includes(id) ? actuales.filter((f) => f !== id) : [...actuales, id]));
  };

  const agregarAlCarro = (producto, cantidad) => {
    if (producto.vendedorId === usuario.id) return "No puedes comprar tus propias publicaciones.";
    if (carro.length > 0 && carro[0].vendedorId !== producto.vendedorId) {
      return `Tu carro tiene productos de ${carro[0].tienda}. Cada compra es de un solo emprendedor, termina esa compra o vacía el carro.`;
    }
    const enCarro = carro.find((item) => item.productoId === producto.id)?.cantidad ?? 0;
    if (enCarro + cantidad > producto.stock) {
      return `Solo quedan ${producto.stock} ${producto.tipo === "Servicio" ? "cupos" : "unidades"} disponibles.`;
    }
    if (enCarro > 0) {
      setCarro(carro.map((item) => (item.productoId === producto.id ? { ...item, cantidad: enCarro + cantidad } : item)));
    } else {
      setCarro([
        ...carro,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          tipo: producto.tipo,
          precio: producto.precioOferta ?? producto.precio,
          cantidad,
          stock: producto.stock,
          vendedorId: producto.vendedorId,
          tienda: producto.tienda,
        },
      ]);
    }
    return "";
  };

  const cambiarCantidad = (productoId, cantidad) => {
    setCarro(carro.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item)));
  };

  const quitarDelCarro = (productoId) => setCarro(carro.filter((item) => item.productoId !== productoId));

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
