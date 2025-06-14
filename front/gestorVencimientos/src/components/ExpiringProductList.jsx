import { useEffect, useState } from 'react';
import axios from 'axios';
import ExpiringProductFilter from './ExpiringProductFilter';

export default function ExpiringProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.from) params.append('from', filters.from);
    if (filters.months) params.append('months', filters.months);
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.type) params.append('type', filters.type);

    const res = await axios.get(import.meta.env.VITE_API_URL + `/products?${params}`);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts(); // cargar por defecto al inicio
  }, []);

  return (
    <div>
      <ExpiringProductFilter onFilter={fetchProducts} />
      
      <h3>Productos por vencer:</h3>
      <ul>
        {products.map(prod => (
          <li key={prod._id}>
            {prod.name} - {prod.type} - {prod.branch} - {new Date(prod.expirationDate).toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' })}
          </li>
        ))}
      </ul>
    </div>
  );
}
