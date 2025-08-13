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
  addMultipleProductsToList,
  addProductToList,
  fetchListById,
  removeMultipleProductsFromList,
  removeProductFromList,
} from "../../api/listApi";
import BarcodeSearchSection from "../../components/lots/BarcodeSearchSection";
import ProductCreateModal from "../../components/products/formularios/ProductCreateModal";
import { exportToTXT } from "../../../utils/exportUtils";
import axios from "axios";

export default function AddProductsLocal() {
  const { listId } = useParams();
  const barcodeInputRef = useRef();

  const [list, setList] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [productExists, setProductExists] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productInfo, setProductInfo] = useState({
    name: "",
    type: "medicamento",
  });
  const [bulkAddInput, setBulkAddInput] = useState("");
  const [bulkRemoveInput, setBulkRemoveInput] = useState("");
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [missingBarcodes, setMissingBarcodes] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

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

  // const handleSearch = async (codebar) => {
  //   if (!codebar) return;
  //   const res = await fetchProducts(codebar);
  //     setLoadingSearch(true);

  //   if (res.length > 0) {
  //     const product = res[0];
  //     setProductExists(true);
  //     setBarcode(product.barcode || codebar);
  //     await handleAddToList(product._id);
  //   } else {
  //     setProductExists(false);
  //     setBarcode(codebar);
  //     setShowCreateModal(true);
  //   }
  // };

  const handleSearch = async (codebar) => {
    if (!codebar) return;
    setLoadingSearch(true);
    try {
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
    } catch (err) {
      console.error("Error en búsqueda:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // const handleAddToList = async (productId) => {
  //   await addProductToList(listId, productId);
  //   loadList();
  //   setBarcode("");
  //   barcodeInputRef.current?.focus();
  // };

  const handleAddToList = async (productId) => {
    await addProductToList(listId, productId);
    showFeedback("Producto agregado correctamente", "success"); // ✅
    loadList();
    setBarcode("");
    barcodeInputRef.current?.focus();
  };

  const handleRemoveFromList = async (productId) => {
    if (!window.confirm("¿Estás seguro que querés eliminar estos productos?"))
      return;
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
    const existingCodes = new Set(
      list.products.map((p) => p.product?.barcode?.trim()).filter(Boolean)
    );

    try {
      const res = await addMultipleProductsToList(listId, codes);
      const { added = [], missing = [] } = res;

      setMissingBarcodes(missing); // 👉 guardar los no encontrados

      let msg = `Se agregaron ${added.length} producto(s).`;
      if (missing.length > 0)
        msg += ` ${missing.length} código(s) no encontrados.`;
      showFeedback(msg);

      setBulkAddInput("");
      loadList();
    } catch (err) {
      console.error(err);
      showFeedback("Error al agregar productos", "error");
    } finally {
      setLoadingBulk(false);
    }
  };


  // const handleBulkRemove = async () => {
  //   if (!window.confirm("¿Estás seguro que querés eliminar estos productos?"))
  //     return;
  //   setLoadingBulk(true);
  //   const codesToRemove = parseBarcodes(bulkRemoveInput);
  //   console.log("codesToRemove",codesToRemove)
  //   const codeToProductMap = {};
  //   list.products.forEach((p) => {
  //     if (p.product?.barcode) {
  //       codeToProductMap[p.product.barcode.trim()] = p.product._id;
  //     }
  //   });

  //   const productIds = codesToRemove
  //     .map((code) => codeToProductMap[code])
  //     .filter(Boolean);

  //   try {
  //     console.log("productIds",productIds)
  //     await removeMultipleProductsFromList(listId, productIds);
  //     showFeedback("Productos eliminados correctamente");
  //     setBulkRemoveInput("");
  //     loadList();
  //   } catch (err) {
  //     console.error(err);
  //     showFeedback("Error al eliminar productos", "error");
  //   } finally {
  //     setLoadingBulk(false);
  //   }
  // };
const handleBulkRemove = async () => {
  if (!window.confirm("¿Estás seguro que querés eliminar estos productos?"))
    return;

  setLoadingBulk(true);
  const codesToRemove = parseBarcodes(bulkRemoveInput); // aquí están los códigos

  try {
    await removeMultipleProductsFromList(listId, codesToRemove); // ahora mando códigos directamente
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

  const handleRemoveSelected = async () => {
    if (!window.confirm("¿Eliminar los productos seleccionados?")) return;
    try {
      await removeMultipleProductsFromList(listId, selectedProducts);
      showFeedback("Productos eliminados correctamente");
      setSelectedProducts([]);
      loadList();
    } catch (err) {
      console.error(err);
      showFeedback("Error al eliminar seleccionados", "error");
    }
  };
  const isAllSelected =
    list?.products?.length > 0 &&
    selectedProducts.length === list.products?.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProducts([]);
    } else {
      const allIds = list.products.map((p) => p.product?._id).filter(Boolean);
      setSelectedProducts(allIds);
    }
  };

    useEffect(() => {
      console.log("BUSCA?")
      if (nameQuery.length < 2) return;
  
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/products/search?name=${nameQuery}`
          );
          setNameResults(res.data);
        } catch (err) {
          console.error("Error buscando por nombre:", err);
        }
      }, 300);
  
      return () => clearTimeout(delayDebounce);
    }, [nameQuery])

  if (!list) return <CircularProgress />;
console.log("Y aca llega¡ namequery",nameQuery)
  return (
    <Box p={3}>
      <Typography variant="h6">
        Agregar productos a la lista: {list.name}
      </Typography>
      {loadingSearch && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(255, 255, 255, 0.6)"
          zIndex={1300}
        >
          <CircularProgress />
        </Box>
      )}

      <BarcodeSearchSection
        barcode={barcode}
        setBarcode={setBarcode}
        setNameQuery={setNameQuery}
        nameQuery={nameQuery}
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
        <Button
          variant="contained"
          onClick={handleBulkAdd}
          disabled={loadingBulk}
        >
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
        <Button
          variant="outlined"
          color="error"
          onClick={handleBulkRemove}
          disabled={loadingBulk}
        >
          Eliminar de lista
        </Button>
      </Box>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1">Productos en la lista:</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {list.products?.map((entry) => {
              const id = entry.product?._id;
              const isSelected = selectedProducts.includes(id);
              return (
                <TableRow key={id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedProducts((prev) =>
                          prev.includes(id)
                            ? prev.filter((pid) => pid !== id)
                            : [...prev, id]
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>{entry.product?.name}</TableCell>
                  <TableCell>{entry.product?.barcode}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFromList(id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      {missingBarcodes.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="subtitle1" color="error">
            Códigos no encontrados ({missingBarcodes.length})
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              fontFamily: "monospace",
              fontSize: 14,
            }}
          >
            {missingBarcodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </Box>
          <Button
            size="small"
            onClick={() =>
              exportToTXT(missingBarcodes, "codigos_no_encontrados.txt")
            }
          >
            Exportar .txt
          </Button>
        </Paper>
      )}
      {selectedProducts.length > 0 && (
        <Box mt={2}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleRemoveSelected}
          >
            Eliminar seleccionados ({selectedProducts.length})
          </Button>
        </Box>
      )}

      {loadingBulk && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255,255,255,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300, // mayor que el z-index de Paper
          }}
        >
          <CircularProgress size={60} />
          <Typography mt={2}>Procesando...</Typography>
        </Box>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
