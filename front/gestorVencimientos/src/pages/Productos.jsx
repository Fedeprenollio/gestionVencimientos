import { useEffect, useState } from "react";
import ProductForm from "../components/products/ProductForm";
import axios from "axios";
import SucursalSelector from "../components/products/SucursalSelector";

export default function Productos() {
    const [products, setProducts] = useState([]);
  const [branch, setBranch] = useState("sucursal1");

  const fetch = async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL + '/products?days=30');
    setProducts(res.data);
  };

  useEffect(() => { fetch(); }, []);
  return (
    <div>
      <h2>Gestión de Productos</h2>
      {/* <ProductForm branch="sucursal1" onAdded={() => {}} />
       //     <h1>Gestión de Productos</h1>*/}


      <SucursalSelector branch={branch} setBranch={setBranch} />
      <ProductForm onAdded={fetch} branch ={branch } /> 
    </div>
  );
}
