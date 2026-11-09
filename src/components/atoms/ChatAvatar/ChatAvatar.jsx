import { Avatar } from "@mui/material";

const iniciales = (nombre) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();

const ChatAvatar = ({ nombre, size = 36 }) => {
  return (
    <Avatar sx={{ width: size, height: size, fontSize: 13, bgcolor: "primary.main", color: "secondary.main" }}>
      {iniciales(nombre)}
    </Avatar>
  );
};

export default ChatAvatar;
