import { useState, useEffect } from "react";
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

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/productos" element={<Productos />} />
        <Route path="/lotes/cargar" element={<ProductForm />} />
        <Route path="/expiring" element={<LotList />} />
        <Route path="/stock-search" element={<SearchStockPage />} />
        <Route path="*" element={<Productos />} />
      </Routes>
    </>
  );
}
export default App;
