import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthTabs = ({ activa }) => {
  const navigate = useNavigate();

  const pestanas = [
    { id: "login", texto: "Iniciar sesión", ruta: "/login" },
    { id: "registro", texto: "Registrarse", ruta: "/registro" },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1, p: 0.5, borderRadius: 1.25, bgcolor: "text.primary" }}>
      {pestanas.map((pestana) => {
        const esActiva = pestana.id === activa;
        return (
          <Button
            key={pestana.id}
            fullWidth
            onClick={() => !esActiva && navigate(pestana.ruta)}
            aria-pressed={esActiva}
            sx={{
              borderRadius: 1,
              fontWeight: esActiva ? 600 : 400,
              bgcolor: esActiva ? "secondary.main" : "transparent",
              color: esActiva ? "primary.main" : "secondary.main",
              "&:hover": { bgcolor: esActiva ? "secondary.main" : "rgba(255,255,255,0.08)" },
            }}
          >
            {pestana.texto}
          </Button>
        );
      })}
    </Box>
  );
};

export default AuthTabs;
