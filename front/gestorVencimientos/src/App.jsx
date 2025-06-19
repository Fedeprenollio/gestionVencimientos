import { useState, useEffect } from 'react';
import ProductForm from './components/products/ProductForm.jsx';
import ProductList from './components/products/ProductList.jsx';
import axios from 'axios';
import ExpiringProductList from './components/products/ExpiringProductList.jsx';
import SucursalSelector from './components/products/SucursalSelector.jsx';
import Productos from './pages/Productos.jsx';
import Lotes from './pages/Lotes.jsx';
import Vencimientos from './pages/Vencimientos.jsx';
import Escaneo from './pages/Escaneo.jsx';
import { Route, Router, Routes } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';

function App() {
  const [products, setProducts] = useState([]);
  const [branch, setBranch] = useState("sucursal1");

  const fetch = async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL + '/products?days=30');
    setProducts(res.data);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/productos" element={<Productos />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/vencimientos" element={<Vencimientos />} />
        <Route path="/escaneo" element={<Escaneo />} />
        <Route path="*" element={<Productos />} />
      </Routes>
    </>
  );


  // return (
  //   <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
  //     <h1>Gestión de Productos</h1>
  //     <SucursalSelector branch={branch} setBranch={setBranch} />
  //     <ProductForm onAdded={fetch} branch ={branch } />
  //     <hr />
  //     {/* <h2>Próximos a vencer</h2>
  //     <ProductList products={products} /> */}
  //     <ExpiringProductList/>
  //   </div>
  // );
}
export default App;
