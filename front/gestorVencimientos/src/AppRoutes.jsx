import React from "react";
import { Route, Routes } from "react-router-dom";
import Productos from "./pages/Productos";
import ProductForm from "./components/products/ProductForm";
import LotList from "./components/lots/LotList";
import SearchStockPage from "./pages/SearchStockPage";
import UserCreatePage from "./pages/user/UserCreatePage";
import VentasUsuarios from "./pages/user/VentasUsuarios";
import BranchList from "./pages/Branch/BranchList";
import BranchForm from "./pages/Branch/BranchForm";
import MainTabs from "./pages/price/MainTabs";
import ProductListForm from "./pages/ProductList/ProductListForm";
import AddProductsLocal from "./pages/ProductList/AddProductsLocal";
import BarcodeSalesAnalyzer from "./pages/ProductList/BarcodeSalesAnalyzer";
import ImportProducts from "./pages/ImportProducts/ImportProducts";
import AnalyzePriceChanges from "./pages/price/AnalyzePriceChanges";
import UploadPrices from "./pages/price/UploadPrices";
import UploadPricesMultiple from "./pages/ProductList/UploadPricesMultiple";
import UploadLogs from "./pages/price/UploadLogs";
import StockCountListPage from "./pages/quickStockCount/StockCountListPage";
import QuickStockCount from "./pages/quickStockCount/QuickStockCount";
import VencimientosPage from "./pages/vencimientosPage/VencimientosPage";
import ImportStockAnalysis from "./pages/importStockAnalysis/ImportStockAnalysis";
import SucursalesContactList from "./pages/contactosYLinks/SucursalesContactList";
import TutorialPage from "./pages/TutorialPage";
import ImportarStock from "./pages/importar/ImportarStock";
import HistorialStock from "./pages/importar/HistorialStock";
import PromotionForm from "./components/PromotionForm";
import { PromotionsPage } from "./pages/promotions/PromotionsPage";
import ProductsToRetag from "./pages/ProductList/ProductsToRetag";
import { Box } from "@mui/material";
import ProductPrices from "./pages/price/ProductPrices";
import StockCountForm from "./pages/quickStockCount/StockCountForm";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import MovementAnalyzer from "./pages/StockAnalysisUploader";
import WhatsAppQR from "./pages/whatsapp/WhatsAppQR";

export const AppRoutes = () => {
  return (
    <Box sx={{ flexGrow: 1, px: 2, pb: 4 }}>
      <Routes>
        <Route path="/productos" element={<Productos />} />
        <Route path="/lotes/cargar" element={<ProductForm />} />
        <Route path="/expiring" element={<LotList />} />
        <Route path="/stock-search" element={<SearchStockPage />} />
        <Route path="/user" element={<UserCreatePage />} />
        <Route path="/users/ventas" element={<VentasUsuarios />} />
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
        <Route path="/lists/:listId/upload-prices" element={<UploadPrices />} />
        <Route
          path="/lists/upload-prices-multiple"
          element={<UploadPricesMultiple />}
        />
        <Route
          path="/listas/:listId/historial-cargas"
          element={<UploadLogs />}
        />
        <Route path="/historial-cargas" element={<UploadLogs />} />
        {/* <Route path="/stock-count" element={<QuickStockCountPage />} /> */}
        <Route path="/stock-count" element={<StockCountListPage />} />
        <Route path="/stock-count/new" element={<StockCountForm />} />
        <Route path="/stock-count/:listId" element={<QuickStockCount />} />
        <Route path="/lists/drug-returns" element={<VencimientosPage />} />
        <Route path="/stock/stockAnalysiss" element={<ImportStockAnalysis />} />
        <Route path="/contacts" element={<SucursalesContactList />} />
        <Route path="/help" element={<TutorialPage />} />
        {/* //IMPORTACION DE STOCK  */}
        {/* <Route path="/" element={<Navigate to="/importar-stock" />} /> */}
        <Route path="/importar-productos" element={<ImportProducts />} />
        <Route path="/importar-stock" element={<ImportarStock />} />
        <Route path="/historial-stock" element={<HistorialStock />} />
        <Route path="/InventoryDashboard" element={<InventoryDashboard />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/whatsapp" element={<WhatsAppQR />} />

        <Route path="/promotions/new" element={<PromotionForm />} />
        {/* <Route
                path="/lists/drug-returns"
                element={<ReturnListManager />}
              /> */}
        <Route path="*" element={<Productos />} />
        <Route path="/analisis" element={<MovementAnalyzer />} />
        <Route
          path="/lists/:listId/products-to-retag"
          element={<ProductsToRetag />}
        />
      </Routes>
    </Box>
  );
};
