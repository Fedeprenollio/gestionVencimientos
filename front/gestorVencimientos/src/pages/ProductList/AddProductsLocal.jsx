import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { fetchProducts, createProduct } from "../../api/productApi";
import {
  addProductToList,
  addQuickProductsToList,
  clearQuickProductsFromList,
  fetchListById,
  getQuickProductsFromList,
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
  const [productInfo, setProductInfo] = useState({
    name: "",
    type: "medicamento",
  });
  const [quickLoadInput, setQuickLoadInput] = useState("");
  const [tempCodes, setTempCodes] = useState([]);

  const localStorageKey = `tempCodesForList_${listId}`;

  // const handleQuickLoadChange = (e) => {
  //   setQuickLoadInput(e.target.value);
  // };

  // const handleQuickLoadSave = () => {
  //   const newCodes = quickLoadInput
  //     .split(",")
  //     .map((c) => c.trim())
  //     .filter((c) => c.length > 0);

  //   const merged = Array.from(new Set([...tempCodes, ...newCodes]));
  //   localStorage.setItem(localStorageKey, JSON.stringify(merged));
  //   setTempCodes(merged);
  //   setQuickLoadInput("");
  // };

  // const handleQuickLoadSave = async () => {
  //   const newCodes = quickLoadInput
  //     .split(",")
  //     .map((c) => c.trim())
  //     .filter((c) => c.length > 0 && !tempCodes.some((t) => t.barcode === c));

  //   const payload = newCodes.map((c) => ({ barcode: c }));

  //   try {
  //     await addQuickProductsToList(listId, payload);
  //     const res = await getQuickProductsFromList(listId);
  //     setTempCodes(res.data || []);
  //     setQuickLoadInput("");
  //   } catch (err) {
  //     console.error("Error al guardar quickProducts", err);
  //   }
  // };

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setTempCodes(parsed);
      } catch (e) {
        console.error("Error parsing localStorage codes", e);
      }
    }
  }, [listId]);
  console.log("setTempCodes,", tempCodes);
  const queryClient = useQueryClient();

  // Cargar lista
  const loadList = async () => {
    const res = await fetchListById(listId);
    setList(res);
  };

  useEffect(() => {
    loadList();
  }, [listId]);

  // Mutación para crear producto
  // const createProductMutation = useMutation(createProduct, {
  //   onSuccess: async (newProduct) => {
  //     setShowCreateModal(false);
  //     setProductExists(true);
  //     await handleAddToList(newProduct._id);
  //     queryClient.invalidateQueries(["list", listId]);
  //   },
  // });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (newProduct) => {
      setShowCreateModal(false);
      setProductExists(true);
      await handleAddToList(newProduct._id);
      queryClient.invalidateQueries(["list", listId]);
    },
  });

  // Buscar producto por código o nombre
  const handleSearch = async (codebar) => {
    if (!codebar) return;
    const res = await fetchProducts(codebar);
    if (res.length > 0) {
      const product = res[0];
      setProductExists(true);
      setBarcode(product.barcode || codebar);
      // Opcional: actualizar otros estados si necesitas
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

  // Buscar por nombre con debounce
  useEffect(() => {
    if (nameQuery.length < 3) return;
    const delayDebounce = setTimeout(async () => {
      const res = await fetchProducts(nameQuery);
      setNameResults(Array.isArray(res) ? res : []);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [nameQuery]);

  useEffect(() => {
    async function loadQuickProducts() {
      try {
        const res = await getQuickProductsFromList(listId);
        console.log("Productos rápidos cargados:", res);

        setTempCodes(res || []);
      } catch (err) {
        console.error("Error al cargar quickProducts", err);
      }
    }
    loadQuickProducts();
  }, [listId]);

  // Crear producto (callback para modal)
  const onCreateProduct = (data) => {
    createProductMutation.mutate(data);
  };
  const handleClearTempCodes = async () => {
    try {
      await clearQuickProductsFromList(listId);
      setTempCodes([]);
    } catch (err) {
      console.error("Error al eliminar todos los códigos rápidos", err);
    }
  };

  // const handleClearTempCodes = () => {
  //   localStorage.removeItem(localStorageKey);
  //   setTempCodes([]);
  // };
  // const handleRemoveSingleCode = (code) => {
  //   const updated = tempCodes.filter((c) => c !== code);
  //   localStorage.setItem(localStorageKey, JSON.stringify(updated));
  //   setTempCodes(updated);
  // };
  const handleRemoveSingleCode = async (code) => {
    const updated = tempCodes.filter((item) => item.barcode !== code);
    try {
      await addQuickProductsToList(listId, updated); // sobrescribe
      setTempCodes(updated);
    } catch (err) {
      console.error("Error al eliminar código", err);
    }
  };

  const handleRemoveFromList = async (productId) => {
    await removeProductFromList(listId, productId);
    loadList();
  };

  // const exportarCodigos = () => {
  //   const dbCodes = list?.products?.map((p) => p.barcode).filter(Boolean) || [];
  //   const lsCodes = tempCodes || [];
  //   const todos = [...dbCodes, ...lsCodes];

  //   exportToTXT(todos, `codigos_lista_${listId}.txt`);
  // };
  const exportarCodigos = () => {
    const dbCodes = list?.products?.map((p) => p.barcode).filter(Boolean) || [];
    const quickCodes =
      tempCodes?.map((q) => q.barcode?.trim()).filter(Boolean) || [];
    exportToTXT([...dbCodes, ...quickCodes], `codigos_lista_${listId}.txt`);
  };

  const dbCodes =
    list?.products?.map((p) => p.barcode?.trim()).filter(Boolean) || [];

  const lsCodes = tempCodes.map((c) => c.barcode?.trim()).filter(Boolean);

  const parseQuickInput = (input) => {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [barcode, name] = line.split(";");
        return {
          barcode: barcode.trim(),
          name: name?.trim() || "",
        };
      });
  };

  // const handleQuickLoadSave = async () => {
  //   const parsedItems = parseQuickInput(quickLoadInput);

  //   const merged = [
  //     ...tempCodes,
  //     ...parsedItems.filter(
  //       (item) => !tempCodes.some((t) => t.barcode === item.barcode)
  //     ),
  //   ];

  //   try {
  //     await addQuickProductsToList(listId, merged);
  //     const res = await getQuickProductsFromList(listId);
  //     setTempCodes(res.data || []);
  //     setQuickLoadInput("");
  //   } catch (err) {
  //     console.error("Error al guardar quickProducts", err);
  //   }
  // };
  const handleQuickLoadSave = async () => {
    const parsedItems = parseQuickInput(quickLoadInput);

    try {
      await addQuickProductsToList(listId, parsedItems);
      const res = await getQuickProductsFromList(listId);
      setTempCodes(res || []);
      setQuickLoadInput("");
    } catch (err) {
      console.error("Error al guardar quickProducts", err);
    }
  };

  const handleClearQuickProducts = async () => {
    try {
      await addQuickProductsToList(listId, []); // vacío = limpiar
      setTempCodes([]);
    } catch (err) {
      console.error("Error al limpiar quickProducts", err);
    }
  };

  if (!list) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h6">
        Agregar productos a la lista: {list.name}
      </Typography>

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

      {/* Modal para crear producto */}
      <ProductCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        barcode={barcode}
        onCreate={onCreateProduct}
        isLoading={createProductMutation.isLoading}
      />
      {/* <Box mt={3} mb={2}>
        <Typography variant="subtitle1" gutterBottom>
          Carga rápida de códigos (separados por coma)
        </Typography>
        <Box display="flex" gap={1}>
          <input
            type="text"
            placeholder="ej: 1234567890123, 2345678901234, 3456789012345"
            value={quickLoadInput}
            onChange={handleQuickLoadChange}
            style={{ flexGrow: 1, padding: "8px" }}
          />
          <Button variant="contained" onClick={handleQuickLoadSave}>
            Guardar
          </Button>
        </Box>
      </Box> */}

      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          Carga rápida de productos (uno por línea)
          <br />
          <small>
            Formato: <code>código</code> o <code>código ; nombre</code>
          </small>
        </Typography>

        <Box display="flex" flexDirection="column" gap={1}>
          <textarea
            value={quickLoadInput}
            onChange={(e) => setQuickLoadInput(e.target.value)}
            rows={6}
            placeholder={`Ejemplo:\n7791234567890\n7790000000001; Jarabe para la tos\n7790000000002; Ibuprofeno`}
            style={{
              width: "100%",
              padding: "10px",
              fontFamily: "monospace",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <Box display="flex" gap={1}>
            <Button variant="contained" onClick={handleQuickLoadSave}>
              Guardar productos rápidos
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearQuickProducts}
            >
              Limpiar todos de BD
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="subtitle1">Productos en la lista:</Typography>
        <List>
          <List>
            {list.products?.map((p) => (
              <ListItem
                key={p._id}
                secondaryAction={
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFromList(p._id)}
                  >
                    Eliminar
                  </Button>
                }
              >
                <ListItemText primary={p.name} secondary={p.barcode} />
              </ListItem>
            ))}
          </List>
        </List>
      </Paper>
      <>
        <List dense>
          {tempCodes.map((item, i) => (
            <ListItem key={i}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography fontWeight={600} mr={1}>
                      {item.barcode}
                    </Typography>
                    {item.name && (
                      <Typography variant="body2" color="text.secondary">
                        {item.name}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleClearTempCodes}
        >
          Eliminar todos los códigos cargados (Carga Rapida)
        </Button>
      </>
      <Box mt={2} display="flex" gap={2}>
        <Button onClick={exportarCodigos}>
          Exportar ambos (Base de Datos + Codigos rapidos)
        </Button>
        <Button onClick={() => exportToTXT(dbCodes, "codigos_base_datos.txt")}>
          Exportar solo Base de Dato
        </Button>
        <Button
          onClick={() => exportToTXT(lsCodes, "codigos_localstorage.txt")}
        >
          Exportar solo Codigos Rapidos
        </Button>
      </Box>
    </Box>
  );
}
