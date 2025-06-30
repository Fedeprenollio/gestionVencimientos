import { useState, useEffect, useMemo } from "react";
import ProductForm from "./components/products/ProductForm.jsx";
import ProductList from "./components/products/ProductList.jsx";
import Productos from "./pages/Productos.jsx";
import Lotes from "./pages/Lotes.jsx";
import Vencimientos from "./pages/Vencimientos.jsx";
import Escaneo from "./pages/Escaneo.jsx";
import { Route, Router, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar.jsx";
import LotList from "./components/lots/LotList.jsx";
import SearchStockPage from "./pages/SearchStockPage.jsx";
import {
  Box,
  createTheme,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import UserCreatePage from "./pages/user/UserCreatePage.jsx";
import LoginPage from "./components/user/LoginPage.jsx";
import StockAnalysisUploader from "./pages/StockAnalysisUploader.jsx";

function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return !savedUser; // si no hay usuario guardado, mostrar login
  });

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleLogin = (userData) => {
  localStorage.setItem("currentUser", JSON.stringify(userData.user));
  localStorage.setItem("token", userData.token); // ✅ guardar el token
  setCurrentUser(userData.user);
  setShowLogin(false);
};


  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setShowLogin(true);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.primary,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar */}
        <Navbar
          onToggleTheme={toggleMode}
          mode={mode}
          currentUser={currentUser}
          onChangeUser={handleLogout}
        />

        {showLogin && <LoginPage onLogin={handleLogin} />}

        {/* Contenido principal */}
        <Box sx={{ flexGrow: 1, px: 2, pb: 4 }}>
          <Routes>
            <Route path="/productos" element={<Productos />} />
            <Route path="/lotes/cargar" element={<ProductForm />} />
            <Route path="/expiring" element={<LotList />} />
            <Route path="/stock-search" element={<SearchStockPage />} />
            <Route path="/user" element={<UserCreatePage />} />
            <Route path="*" element={<Productos />} />
            <Route path="/analisis" element={<StockAnalysisUploader />} />
          </Routes>
        </Box>
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            minHeight: 300,
            mt: "auto",
            px: 2,
            display: "flex",
            alignItems: "center", // centra verticalmente
            justifyContent: "center", // centra horizontalmente
            borderTop: "1px solid",
            borderColor: "divider",
            fontSize: "0.875rem",
            textAlign: "center",
          }}
        >
          <Typography>© {new Date().getFullYear()} Gestión Farmacia</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
export default App;
