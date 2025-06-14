import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm.jsx';
import ProductList from './components/ProductList.jsx';
import axios from 'axios';
import ExpiringProductList from './components/ExpiringProductList.jsx';

function App() {
  const [products, setProducts] = useState([]);

  const fetch = async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL + '/products?days=30');
    setProducts(res.data);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Gestión de Productos</h1>
      <ProductForm onAdded={fetch} />
      <hr />
      <h2>Próximos a vencer</h2>
      <ProductList products={products} />
      <ExpiringProductList/>
    </div>
  );
}
export default App;
