import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import theme from "./styles/theme";
import { UserProvider } from "./contexts/UserContext/UserProvider";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
