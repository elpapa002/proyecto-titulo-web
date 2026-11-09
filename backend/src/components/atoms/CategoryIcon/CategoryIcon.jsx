import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import HomeRepairServiceOutlinedIcon from "@mui/icons-material/HomeRepairServiceOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

const iconos = {
  alimentos: RestaurantOutlinedIcon,
  artesania: BrushOutlinedIcon,
  vestuario: CheckroomOutlinedIcon,
  servicios: HomeRepairServiceOutlinedIcon,
};

const CategoryIcon = ({ ruta, ...props }) => {
  const Icono = iconos[ruta] ?? CategoryOutlinedIcon;
  return <Icono fontSize="small" {...props} />;
};

export default CategoryIcon;
