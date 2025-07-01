import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { fetchProducts, createProduct } from "../../api/productApi";
import {
  addProductToList,
  fetchListById,
  removeProductFromList,
} from "../../api/listApi";
import BarcodeSearchSection from "../../components/lots/BarcodeSearchSection";
import ProductCreateModal from "../../components/products/formularios/ProductCreateModal";
import { exportToTXT } from "../../../utils/exportUtils";

export default function AddProductsLocal() {
  const { listId } = useParams();
  const barcodeInputRef = useRef();

  const [list, setList] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [productExists, setProductExists] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productInfo, setProductInfo] = useState({ name: "", type: "medicamento" });
  const [bulkAddInput, setBulkAddInput] = useState("");
  const [bulkRemoveInput, setBulkRemoveInput] = useState("");
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });

  const queryClient = useQueryClient();

  const showFeedback = (message, severity = "success") => {
    setFeedback({ open: true, message, severity });
  };

  const loadList = async () => {
    const res = await fetchListById(listId);
    setList(res);
  };

  useEffect(() => {
    loadList();
  }, [listId]);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (newProduct) => {
      setShowCreateModal(false);
      setProductExists(true);
      await handleAddToList(newProduct._id);
      queryClient.invalidateQueries(["list", listId]);
    },
  });

  const handleSearch = async (codebar) => {
    if (!codebar) return;
    const res = await fetchProducts(codebar);
    if (res.length > 0) {
      const product = res[0];
      setProductExists(true);
      setBarcode(product.barcode || codebar);
      await handleAddToList(product._id);
    } else {
      setProductExists(false);
      setBarcode(codebar);
      setShowCreateModal(true);
    }
  };

  const handleAddToList = async (productId) => {
    await addProductToList(listId, productId);
    loadList();
    setBarcode("");
    barcodeInputRef.current?.focus();
  };

  const handleRemoveFromList = async (productId) => {
     if (!window.confirm("¿Estás seguro que querés eliminar estos productos?")) return;
    try {
      await removeProductFromList(listId, productId);
      showFeedback("Producto eliminado correctamente", "success");
      loadList();
    } catch (err) {
      console.error("Error al eliminar producto", err);
      showFeedback("Error al eliminar producto", "error");
    }
  };

  const parseBarcodes = (input) => {
    return input
      .split(/[\s,;]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
  };

  const handleBulkAdd = async () => {
    setLoadingBulk(true);
    const codes = parseBarcodes(bulkAddInput);
    const existingCodes = new Set(list.products.map((p) => p.barcode?.trim()).filter(Boolean));

    try {
      for (const code of codes) {
        const results = await fetchProducts(code);
        const product = results?.[0];
        if (product && !existingCodes.has(product.barcode)) {
          await addProductToList(listId, product._id);
        }
      }
      showFeedback("Códigos agregados correctamente");
      setBulkAddInput("");
      loadList();
    } catch (err) {
      console.error(err);
      showFeedback("Error al agregar productos", "error");
    } finally {
      setLoadingBulk(false);
    }
  };

  const handleBulkRemove = async () => {
    if (!window.confirm("¿Estás seguro que querés eliminar estos productos?")) return;
    setLoadingBulk(true);
    const codesToRemove = parseBarcodes(bulkRemoveInput);
    const codeToProductMap = {};
    list.products.forEach((p) => {
      if (p.barcode) codeToProductMap[p.barcode.trim()] = p._id;
    });

    try {
      for (const code of codesToRemove) {
        const productId = codeToProductMap[code];
        if (productId) {
          await removeProductFromList(listId, productId);
        }
      }
      showFeedback("Productos eliminados correctamente");
      setBulkRemoveInput("");
      loadList();
    } catch (err) {
      console.error(err);
      showFeedback("Error al eliminar productos", "error");
    } finally {
      setLoadingBulk(false);
    }
  };

  if (!list) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h6">Agregar productos a la lista: {list.name}</Typography>

      <BarcodeSearchSection
        barcode={barcode}
        setBarcode={setBarcode}
        setNameQuery={setNameQuery}
        nameResults={nameResults}
        setProductExists={setProductExists}
        handleSearch={handleSearch}
        handleDetected={handleSearch}
        scanning={false}
        setScanning={() => {}}
        barcodeInputRef={barcodeInputRef}
        setProductInfo={setProductInfo}
        isAddMode={true}
      />

      <ProductCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        barcode={barcode}
        onCreate={(data) => createProductMutation.mutate(data)}
        isLoading={createProductMutation.isLoading}
      />

      <Box mt={4} display="flex" gap={2}>
        <TextField
          label="Códigos a agregar"
          placeholder="Separados por espacio, coma o salto de línea"
          multiline
          fullWidth
          rows={4}
          value={bulkAddInput}
          onChange={(e) => setBulkAddInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleBulkAdd} disabled={loadingBulk}>
          Agregar a lista
        </Button>
      </Box>

      <Box mt={2} display="flex" gap={2}>
        <TextField
          label="Códigos a eliminar"
          placeholder="Separados por espacio, coma o salto de línea"
          multiline
          fullWidth
          rows={4}
          value={bulkRemoveInput}
          onChange={(e) => setBulkRemoveInput(e.target.value)}
        />
        <Button variant="outlined" color="error" onClick={handleBulkRemove} disabled={loadingBulk}>
          Eliminar de lista
        </Button>
      </Box>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1">Productos en la lista:</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.products?.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.barcode}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="error" onClick={() => handleRemoveFromList(p._id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {loadingBulk && <Typography mt={2}>Procesando...</Typography>}

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
