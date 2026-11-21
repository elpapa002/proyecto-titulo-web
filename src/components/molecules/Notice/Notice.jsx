import { Snackbar, SnackbarContent } from "@mui/material";

const Notice = ({ mensaje, onClose }) => {
  return (
    <Snackbar
      open={Boolean(mensaje)}
      autoHideDuration={4500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <SnackbarContent message={mensaje} sx={{ bgcolor: "primary.main", color: "secondary.main", fontSize: 14 }} />
    </Snackbar>
  );
};

export default Notice;
