import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import CustomButton from "../../atoms/Button/CustomButton";

// muestra una sola vez la clave temporal que genero el backend para que el administrador se la entregue a la persona
const TempPasswordDialog = ({ datos, onCerrar }) => (
  <Dialog open={Boolean(datos)} onClose={onCerrar} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 600, color: "primary.main", pb: 1 }}>Clave temporal</DialogTitle>
    <DialogContent>
      <Typography>La clave temporal de {datos?.nombre} es:</Typography>
      <Box
        sx={{
          my: 1.5,
          p: 1.5,
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 1,
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {datos?.clave}
      </Box>
      <Typography variant="body2">
        Entrégasela a la persona. Solo se muestra esta vez y la debe cambiar en Mi perfil al entrar.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <CustomButton onClick={onCerrar}>Entendido</CustomButton>
    </DialogActions>
  </Dialog>
);

export default TempPasswordDialog;
