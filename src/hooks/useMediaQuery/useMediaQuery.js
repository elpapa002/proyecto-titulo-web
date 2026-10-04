import { useMediaQuery as useMediaQueryMui, useTheme } from "@mui/material";

const useMediaQuery = () => {
  const theme = useTheme();
  const esMovil = useMediaQueryMui(theme.breakpoints.down("md"));
  return { esMovil };
};

export default useMediaQuery;
