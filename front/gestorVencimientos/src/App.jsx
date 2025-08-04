import { useState, useEffect, useMemo } from "react";
import ProductForm from "./components/products/ProductForm.jsx";
import ProductList from "./components/products/ProductList.jsx";
import Productos from "./pages/Productos.jsx";
import Lotes from "./pages/Lotes.jsx";
import Vencimientos from "./pages/Vencimientos.jsx";
import Escaneo from "./pages/Escaneo.jsx";
import { Navigate, Route, Routes } from "react-router-dom";
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
import BranchList from "./pages/Branch/BranchList.jsx";
import BranchForm from "./pages/Branch/BranchForm.jsx";
import ProductListForm from "./pages/ProductList/ProductListForm.jsx";
import ProductListList from "./pages/ProductList/ProductListList.jsx";
import AddProductsLocal from "./pages/ProductList/AddProductsLocal.jsx";
import BarcodeSalesAnalyzer from "./pages/ProductList/BarcodeSalesAnalyzer.jsx";
import ImportProducts from "./pages/ImportProducts/ImportProducts.jsx";
import ProductPrices from "./pages/price/ProductPrices.jsx";
import AnalyzePriceChanges from "./pages/price/AnalyzePriceChanges.jsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UploadPrices from "./pages/price/UploadPrices.jsx";
import UploadPricesMultiple from "./pages/ProductList/UploadPricesMultiple.jsx";
import ProductsToRetag from "./pages/ProductList/ProductsToRetag.jsx";
import UploadLogs from "./pages/price/UploadLogs.jsx";
import QuickStockCount from "./pages/quickStockCount/QuickStockCount.jsx";
import CreateStockCountList from "./pages/quickStockCount/StockCountForm.jsx";
import StockCountListPage from "./pages/quickStockCount/StockCountListPage.jsx";
import QuickStockCountPage from "./pages/quickStockCount/QuickStockCountPage.jsx";
import MainTabs from "./pages/price/MainTabs.jsx";
import VencimientosPage from "./pages/vencimientosPage/VencimientosPage.jsx";
import ReturnListManager from "./components/returnList/ReturnListManager.jsx";
import ImportStockAnalysis from "./pages/importStockAnalysis/ImportStockAnalysis.jsx";
import SucursalesContactList from "./pages/contactosYLinks/SucursalesContactList.jsx";
import ImportarStock from "./pages/importar/ImportarStock.jsx";
import HistorialStock from "./pages/importar/HistorialStock.jsx";
import TutorialPage from "./pages/TutorialPage.jsx";
import InventoryDashboard from "./pages/inventory/InventoryDashboard.jsx";
import VentasUsuarios from "./pages/user/VentasUsuarios.jsx";
import PromotionForm from "./components/PromotionForm.jsx";
import { PromotionsPage } from "./pages/promotions/PromotionsPage.jsx";
import axios from "axios";
import usePromoStore from "./store/usePromoStore.js";
import { AppRoutes } from "./AppRoutes.jsx";

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

  // const handleLogin = (userData) => {
  //   localStorage.setItem("currentUser", JSON.stringify(userData.user));
  //   localStorage.setItem("token", userData.token); // ✅ guardar el token
  //   setCurrentUser(userData.user);
  //   setShowLogin(false);
  // };

  const handleLogin = async (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData.user));
    localStorage.setItem("token", userData.token);
    setCurrentUser(userData.user);
    setShowLogin(false);

    // ✅ También cargamos promos vencidas
    const selectedBranchId = localStorage.getItem("selectedBranchId");
    if (selectedBranchId) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/promotions/expired`,
          {
            params: { branchId: selectedBranchId },
            headers: { Authorization: `Bearer ${userData.token}` },
          }
        );
        usePromoStore.getState().setPromotions(res.data);
      } catch (error) {
        console.error("Error cargando promociones vencidas:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setShowLogin(true);
  };
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          {showLogin ? (
            <Routes>
              <Route path="/users/create" element={<UserCreatePage />} />
              <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
            </Routes>
          ) : (
            <AppRoutes />
          )}

          {/* Contenido principal */}

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
            <Typography>
              © {new Date().getFullYear()} Gestión Farmacia
            </Typography>
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
