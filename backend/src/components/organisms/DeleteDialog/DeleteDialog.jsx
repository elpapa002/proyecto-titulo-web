import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";

const DeleteDialog = ({ open, titulo, mensaje, onCancelar, onConfirmar }) => {
  return (
    <Dialog open={open} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: "primary.main", pb: 1 }}>{titulo}</DialogTitle>
      <DialogContent>
        <Typography>{mensaje}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCancelar}>
          Cancelar
        </CustomButton>
        <CustomButton onClick={onConfirmar} startIcon={<DeleteOutlinedIcon />}>
          Eliminar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
