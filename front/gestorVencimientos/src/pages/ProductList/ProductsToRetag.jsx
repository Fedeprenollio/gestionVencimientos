import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { exportToTXT } from "../../../utils/exportUtils";
import api from "../../api/axiosInstance";

export default function ProductsToRetag() {
  const { listId } = useParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchProductsToRetag = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/product-lists/${listId}/products-to-retag`);
      console.log("RESSS", res)
      setProducts(res.productsToRetag || []);
    } catch (err) {
      setError("Error al obtener productos a reetiquetar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const barcodes = products.map((p) => p.barcode);
    exportToTXT(barcodes, `productos_a_reetiquetar_${listId}.txt`);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Productos a reetiquetar
      </Typography>

      <Button variant="contained" onClick={fetchProductsToRetag} disabled={loading}>
        {loading ? "Cargando..." : "Cargar productos"}
      </Button>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {!loading && products.length > 0 && (
        <>
          <Typography mt={2} mb={1}>
            {products.length} producto{products.length > 1 ? "s" : ""} necesitan reetiquetar:
          </Typography>

          <List dense>
            {products.map((p) => (
              <ListItem key={p._id}>
                <ListItemText
                  primary={`${p.name} (${p.barcode})`}
                  secondary={`Último tag: ${new Date(p.lastTagDate).toLocaleDateString()} | Último cambio precio: ${new Date(
                    p.lastPriceChange
                  ).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>

          <Button variant="outlined" onClick={handleExport}>
            Exportar códigos a TXT
          </Button>
        </>
      )}

      {!loading && products.length === 0 && (
        <Typography mt={2}>No hay productos que necesiten reetiquetar.</Typography>
      )}
    </Box>
  );
}
