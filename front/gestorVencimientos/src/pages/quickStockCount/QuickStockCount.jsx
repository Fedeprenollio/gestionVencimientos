import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import api from "../../api/axiosInstance";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function QuickStockCount() {
  const { listId } = useParams();
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [listInfo, setListInfo] = useState(null); // nombre, sucursal, fecha
console.log("ITEM", items)
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get(`/stock-count/${listId}`);
        const data = res;
console.log("FATA",data)
        setListInfo({
          name: data.name || "Sin nombre",
          branch: data.branch?.name || "Sucursal desconocida",
          date: new Date(data.createdAt).toLocaleDateString(),
        });

        const loadedItems = data.products.map((item) => ({
          barcode: item.product?.barcode || "Desconocido",
          name: item.product?.name || "Desconocido",
          quantity: item.quantity,
        }));
        setItems(loadedItems);
      } catch (err) {
        console.error("Error cargando lista:", err);
        setError("Error al cargar productos ya registrados");
      }
    };

    fetchList();
  }, [listId]);

  // ✅ Al montar, traemos los productos ya cargados
//   useEffect(() => {
//     const fetchList = async () => {
//       try {
//         const res = await api.get(`/stock-count/${listId}`);
//         const loadedItems = res.products.map((item) => ({
//           barcode: item.product?.barcode || "Desconocido",
//           quantity: item.quantity,
//           name: item.product?.name || "Desconocido",
//         }));
//         setItems(loadedItems);
//       } catch (err) {
//         console.error("Error cargando lista:", err);
//         setError("Error al cargar productos ya registrados");
//       }
//     };

//     fetchList();
//   }, [listId]);


 const exportToExcel = () => {
  const worksheetData = [
    ["Nombre de la lista:", listInfo?.name || ""],
    ["Sucursal:", listInfo?.branch || ""],
    ["Fecha de creación:", listInfo?.date || ""],
    [],
    ["Código", "Nombre", "Cantidad"],
    ...items.map((item) => [item.barcode, item.name, item.quantity]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Conteo");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Recuento_stock_${listId}.xlsx`);
};

  const handleAdd = async () => {
  setError("");
  setMessage("");

  if (!barcode || quantity === 0) {
    setError("Ingresá un código válido y una cantidad distinta de 0");
    return;
  }

  try {
    const res = await api.post(`/stock-count/${listId}/add-product`, {
      barcode,
      quantity: parseInt(quantity),
    });
    console.log("RESSSS", res)
    const { addedProduct } = res;

    const existingIndex = items.findIndex((item) => item.barcode === barcode);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += parseInt(quantity);
      setItems(updated);
    } else {
      setItems([...items, {
        barcode: addedProduct.barcode,
        quantity: addedProduct.quantity,
        name: addedProduct.nombre,
      }]);
    }

    setMessage("Producto registrado");
    // playBeep();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Error al agregar producto");
  } finally {
    setQuantity(1);
    setBarcode("");
  }
};


  const playBeep = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🧾 Recuento rápido de stock
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: message ? "#e0f7e9" : "#f9f9f9",
          transition: "background-color 0.3s",
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Escaneá productos
        </Typography>

        <Box
          display="flex"
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "flex-end" }}
        >
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{ width: 100 }}
          />
          <TextField
            label="Código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd}>
            Agregar
          </Button>
        </Box>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
        {message && (
          <Typography color="primary" mt={2}>
            {message}
          </Typography>
        )}
      </Paper>

      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            🧮 Productos contados ({items.length})
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Código</b>
                </TableCell>
                <TableCell>
                  <b>Producto</b>
                </TableCell>
                <TableCell align="right">
                  <b>Cantidad</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(({ barcode, quantity, name }) => (
                <TableRow key={barcode}>
                  <TableCell>{barcode}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell align="right">{quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Button variant="outlined" onClick={exportToExcel} sx={{ mt: 2 }}>
        Exportar a Excel
      </Button>
    </Box>
  );
}
