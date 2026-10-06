import { useState } from "react";
import { Box, Drawer } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../../organisms/Sidebar/Sidebar";
import useMediaQuery from "../../../hooks/useMediaQuery/useMediaQuery";
import "../../../styles/Panel.css";

const PanelTemplate = ({ tipo = "admin" }) => {
  const { esMovil } = useMediaQuery();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <Box className="panel">
      {esMovil ? (
        <Drawer
          open={menuAbierto}
          onClose={() => setMenuAbierto(false)}
          slotProps={{ paper: { sx: { bgcolor: "text.primary" } } }}
        >
          <Sidebar tipo={tipo} onNavegar={() => setMenuAbierto(false)} />
        </Drawer>
      ) : (
        <Box component="aside" className="panel-lateral">
          <Sidebar tipo={tipo} />
        </Box>
      )}

      <Box component="main" className="panel-contenido">
        <Outlet context={{ abrirMenu: () => setMenuAbierto(true), esMovil }} />
      </Box>
    </Box>
  );
};

export default PanelTemplate;
