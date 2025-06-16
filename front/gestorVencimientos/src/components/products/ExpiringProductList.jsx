import { useEffect, useState } from "react";
import axios from "axios";
import ExpiringProductFilter from "./ExpiringProductFilter";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  exportToExcel,
  exportToPDF,
  formatDate,
  formatDateWhitDay,
} from "../../../utils/exportUtils";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export default function ExpiringProductList() {
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState("expiration");

  const handleExportPDF = () => {
    exportToPDF(products, sortBy);
  };

  const fetchProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.months) params.append("months", filters.months);
    if (filters.branch) params.append("branch", filters.branch);
    if (filters.type) params.append("type", filters.type);

    const res = await axios.get(
      import.meta.env.VITE_API_URL + `/products?${params}`
    );
    setProducts(res.data);
  };

  const deleteLot = async (productId, lotId) => {
    if (!confirm("¿Eliminar este lote?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}/lots/${lotId}`
      );
      fetchProducts(); // refrescar lista
    } catch (err) {
      alert("Error al eliminar el lote");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  console.log("products", products);
  return (
    <div>
      <ExpiringProductFilter onFilter={fetchProducts} />
      <h3>Productos por vencer:</h3>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            label="Ordenar por"
          >
            <MenuItem value="expiration">Vencimiento</MenuItem>
            <MenuItem value="name">Nombre</MenuItem>
            <MenuItem value="quantity">Cantidad</MenuItem>
          </Select>
        </FormControl>

        <Button onClick={handleExportPDF} variant="contained" color="primary">
          Exportar PDF
        </Button>
      </Box>

      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => exportToExcel(products)}>
          Exportar a Excel
        </Button>
        {/* <button onClick={() => exportToPDF(products)} style={{ marginLeft: 8 }}>
    Exportar a PDF
  </button> */}
      </div>

      <ul>
        {products.map((prod) => (
          <li key={prod._id}>
            <strong>{prod.name}</strong> ({prod.type})
            <ul>
              {prod.lots.map((lot) => (
                <li key={lot._id}>
                  {lot.branch} - {lot.quantity} unidades -{" "}
                  {formatDate(lot.expirationDate)} - Lectura: {formatDateWhitDay(lot?.createdAt)}
                  <Tooltip title="Eliminar lote">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteLot(prod._id, lot._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
