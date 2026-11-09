import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const InfoHint = ({ texto, sx }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
        border: "1px solid",
        borderColor: "text.primary",
        borderRadius: 1,
        p: 1.5,
        ...sx,
      }}
    >
      <InfoOutlinedIcon fontSize="small" sx={{ mt: "1px" }} />
      <Typography>{texto}</Typography>
    </Box>
  );
};

export default InfoHint;
