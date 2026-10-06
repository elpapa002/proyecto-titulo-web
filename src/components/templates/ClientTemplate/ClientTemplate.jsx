import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import ClientHeader from "../../organisms/ClientHeader/ClientHeader";
import useMediaQuery from "../../../hooks/useMediaQuery/useMediaQuery";
import "../../../styles/Tienda.css";

const ClientTemplate = () => {
  const { esMovil } = useMediaQuery();
  const [favoritos, setFavoritos] = useState([]);

  const alternarFavorito = (id) => {
    setFavoritos((actuales) => (actuales.includes(id) ? actuales.filter((f) => f !== id) : [...actuales, id]));
  };

  return (
    <Box className="tienda">
      <ClientHeader cantidadDeseos={favoritos.length} />
      <Box component="main" className="tienda-contenido">
        <Outlet context={{ esMovil, enTienda: true, favoritos, alternarFavorito }} />
      </Box>
    </Box>
  );
};

export default ClientTemplate;
