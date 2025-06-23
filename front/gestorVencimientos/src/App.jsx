import { useState, useEffect, useMemo } from "react";
import ProductForm from "./components/products/ProductForm.jsx";
import ProductList from "./components/products/ProductList.jsx";
import axios from "axios";
import ExpiringProductList from "./components/products/ExpiringProductList.jsx";
import SucursalSelector from "./components/products/SucursalSelector.jsx";
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
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

function App() {
   const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);


  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          Gestión Farmacia
        </Box>
        <Box>
          <IconButton onClick={toggleMode} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Box>
      <Navbar />
      <Routes>
        <Route path="/productos" element={<Productos />} />
        <Route path="/lotes/cargar" element={<ProductForm />} />
        <Route path="/expiring" element={<LotList />} />
        <Route path="/stock-search" element={<SearchStockPage />} />
        <Route path="*" element={<Productos />} />
      </Routes>
    </ThemeProvider>
  );
}
export default App;
