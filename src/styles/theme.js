import { createTheme } from "@mui/material/styles";

const PRIMARIO = "#1D2A3B";
const SECUNDARIO = "#FFFFFF";
const TERCIARIO = "#2B2E33";

const theme = createTheme({
  palette: {
    primary: { main: PRIMARIO, contrastText: SECUNDARIO },
    secondary: { main: SECUNDARIO, contrastText: PRIMARIO },
    error: { main: PRIMARIO, contrastText: SECUNDARIO },
    text: { primary: TERCIARIO, secondary: TERCIARIO },
    background: { default: SECUNDARIO, paper: SECUNDARIO },
    divider: TERCIARIO,
  },
  typography: {
    fontFamily: '"Instrument Sans", sans-serif',
    h1: { fontSize: 28, fontWeight: 700, color: PRIMARIO },
    h2: { fontSize: 22, fontWeight: 600, color: PRIMARIO },
    h3: { fontSize: 18, fontWeight: 600, color: PRIMARIO },
    body1: { fontSize: 14 },
    body2: { fontSize: 12 },
    button: { textTransform: "none", fontWeight: 600, fontSize: 14 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40, paddingInline: 16 } },
      variants: [
        {
          props: { variant: "contained", color: "secondary" },
          style: { "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.88)" } },
        },
      ],
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderColor: TERCIARIO,
          "&.Mui-selected": {
            backgroundColor: PRIMARIO,
            borderColor: PRIMARIO,
            color: SECUNDARIO,
            "&:hover": { backgroundColor: PRIMARIO },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: SECUNDARIO,
          minHeight: 44,
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderWidth: 2 },
        },
        notchedOutline: { borderColor: TERCIARIO },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: TERCIARIO, fontSize: 14 },
        head: { fontSize: 12, fontWeight: 500 },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
  },
});

export default theme;
