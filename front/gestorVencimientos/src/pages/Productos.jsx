import { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography } from "@mui/material";
import ProductFormSimple from "../components/products/formularios/ProductFormSimple";
import ProductLotsAccordion from "../components/products/ProductLotsAccordion";
import ProductListGrid from "../components/products/ProductListGrid";
import ProductQuickSearch from "../components/products/ProductQuickSearch";

export default function Productos() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [editing, setEditing] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [lots, setLots] = useState({});
  const [loadingLots, setLoadingLots] = useState(false);

  const searchProducts = async () => {
    if (!query.trim()) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/search?name=${query}`
      );
      setResults(res.data);
    } catch (err) {
      alert("Error buscando productos");
    }
  };

  const toggleExpand = async (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));

    if (!lots[productId]) {
      setLoadingLots(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/lots/product/${productId}`
        );
        setLots((prev) => ({ ...prev, [productId]: res.data }));
      } catch (err) {
        alert("Error cargando lotes");
      } finally {
        setLoadingLots(false);
      }
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${editing._id}`,
        updatedData
      );
      setEditing(null);
      searchProducts();
    } catch (err) {
      alert("Error actualizando producto");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
      searchProducts();
    } catch (err) {
      alert("Error al eliminar producto");
    }
  };

  const handleDeleteLot = async (lot) => {
    if (!confirm("¿Eliminar lote?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/lots/${lot._id}`);
      searchProducts(); // refrescamos
    } catch (err) {
      alert("Error al eliminar lote");
    }
  };

  const handleAddLot = (product) => {
    alert(`Agregar lote para producto ${product.name}`);
    // Podés abrir un modal o navegar a un formulario
  };

  const handleEditLot = (lot) => {
    alert(`Editar lote ${lot._id}`);
  };

  return (
    <Box sx={{  width: "100vw", pt: 2 }}>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <ProductQuickSearch
          query={query}
          setQuery={setQuery}
          onSearch={searchProducts}
        />

        {editing ? (
          <>
            <Typography variant="h6" gutterBottom>
              Editando producto
            </Typography>
            <ProductFormSimple
              initialData={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </>
        ) : (
          results.map((product) => (
            <ProductLotsAccordion
              key={product._id}
              product={product}
              isExpanded={expandedProductId === product._id}
              onToggleExpand={() => toggleExpand(product._id)}
              lots={lots[product._id] || []}
              loadingLots={loadingLots}
              onEditProduct={setEditing}
              onDeleteProduct={handleDelete}
              onAddLot={handleAddLot}
              onEditLot={handleEditLot}
              onDeleteLot={handleDeleteLot}
            />
          ))
        )}
      </Box>
      <Box sx={{pt:2, pb: 6,  mt: 4, px: 2 }}>
        <ProductListGrid />
      </Box>
    </Box>
  );
}
