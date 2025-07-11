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

          {showLogin && <LoginPage onLogin={handleLogin} />}

          {/* Contenido principal */}
          <Box sx={{ flexGrow: 1, px: 2, pb: 4 }}>
            <Routes>
              <Route path="/productos" element={<Productos />} />
              <Route path="/lotes/cargar" element={<ProductForm />} />
              <Route path="/expiring" element={<LotList />} />
              <Route path="/stock-search" element={<SearchStockPage />} />
              <Route path="/user" element={<UserCreatePage />} />
              <Route path="/branches" element={<BranchList />} />
              <Route path="/branches/new" element={<BranchForm />} />
              <Route path="/branches/:id" element={<BranchForm />} />
              {/* <Route path="/lists" element={<ProductListList />} /> */}
              <Route path="/lists" element={<MainTabs />} />

              <Route path="/lists/new" element={<ProductListForm />} />
              <Route path="/lists/edit/:id" element={<ProductListForm />} />
              <Route
                path="/lists/:listId/add-products"
                element={<AddProductsLocal />}
              />
              <Route
                path="/lists/:listId/analyze-sales"
                element={<BarcodeSalesAnalyzer />}
              />
              <Route path="/products/import" element={<ImportProducts />} />
              <Route path="/users/create" element={<UserCreatePage />} />
              <Route path="/products/prices" element={<ProductPrices />} />
              <Route
                path="/list/:listId/analyze-prices"
                element={<AnalyzePriceChanges />}
              />
              <Route
                path="/lists/:listId/upload-prices"
                element={<UploadPrices />}
              />
              <Route
                path="/lists/upload-prices-multiple"
                element={<UploadPricesMultiple />}
              />
              <Route
                path="/listas/:listId/historial-cargas"
                element={<UploadLogs />}
              />
              {/* <Route path="/stock-count" element={<QuickStockCountPage />} /> */}
              <Route path="/stock-count" element={<StockCountListPage />} />
              <Route
                path="/stock-count/new"
                element={<CreateStockCountList />}
              />
              <Route
                path="/stock-count/:listId"
                element={<QuickStockCount />}
              />

              <Route
                path="/lists/drug-returns"
                element={<VencimientosPage />}
              />
              <Route
                path="/stock/stockAnalysiss"
                element={<ImportStockAnalysis />}
              />
              <Route path="/contacts" element={<SucursalesContactList />} />

              {/* //IMPORTACION DE STOCK  */}
              {/* <Route path="/" element={<Navigate to="/importar-stock" />} /> */}
              <Route path="/importar-productos" element={<ImportProducts />} />
              <Route path="/importar-stock" element={<ImportarStock />} />
              <Route path="/historial-stock" element={<HistorialStock />} />

              {/* <Route
                path="/lists/drug-returns"
                element={<ReturnListManager />}
              /> */}
              <Route path="*" element={<Productos />} />
              <Route path="/analisis" element={<StockAnalysisUploader />} />

              <Route
                path="/lists/:listId/products-to-retag"
                element={<ProductsToRetag />}
              />
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
