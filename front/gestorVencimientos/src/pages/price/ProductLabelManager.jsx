// ProductLabelManager.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TextField,
} from "@mui/material";
import ClasicasInput from "./ClasicasInput";
import EspecialesInput from "./EspecialesInput";
import EtiquetaPreview from "./EtiquetaPreview";
import { Modal } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // ícono opcional
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExcelDiscountUploader from "./ExcelDiscountUploader";
import useStockStore from "../../store/useStockStore";
import SucursalSelector from "../../components/SucursalSelector";
import { generateBarcodeImage } from "../../../utils/generateBarcodeImage";
import {
  generatePDF_Clasicas,
  generatePDF_Grandes,
} from "../../../utils/etiquetas/generatePDF";
import api from "../../api/axiosInstance";
import useBranchStore from "../../store/useBranchStore";

const ProductLabelManager = () => {
  const { updateBulkStock } = useStockStore();
  const [clasicos, setClasicos] = useState(() => {
  const saved = localStorage.getItem("labels_clasicos");
  return saved ? JSON.parse(saved) : [];
});
const [especiales, setEspeciales] = useState(() => {
  const saved = localStorage.getItem("labels_especiales");
  return saved ? JSON.parse(saved) : [];
});

  const [tabIndex, setTabIndex] = useState(0); // Estado para la pestaña activa
  // Nuevo estado
  const [openModal, setOpenModal] = useState(false);
  const [updateResults, setUpdateResults] = useState([]);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const clasicosConStock = clasicos.filter((p) => p.stock > 0);
  const clasicosSinStock = clasicos.filter((p) => !p.stock || p.stock <= 0);
  const especialesConStock = especiales.filter((p) => p.stock > 0);
  const especialesSinStock = especiales.filter((p) => !p.stock || p.stock <= 0);
  const [importId, setImportId] = useState(false);
  const [scale, setScale] = useState(1); // valor por defecto = 1

  const { selectedBranchId } = useBranchStore();


  useEffect(() => {
    localStorage.setItem("labels_clasicos", JSON.stringify(clasicos));
  }, [clasicos]);


  useEffect(() => {
    localStorage.setItem("labels_especiales", JSON.stringify(especiales));
  }, [especiales]);

  const handleRemoveEspecial = (index) => {
    setEspeciales((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEspecialField = (index, field, value) => {
    setEspeciales((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      const base =
        updated[index].manualPreviousPrice &&
        updated[index].manualPreviousPrice > 0
          ? updated[index].manualPreviousPrice
          : updated[index].manualPrice && updated[index].manualPrice > 0
          ? updated[index].manualPrice
          : updated[index].currentPrice || 0;

      const discount = updated[index].discount || 0;
      updated[index].discountedPrice = Number(
        (base * (1 - discount / 100)).toFixed(2)
      );

      return updated;
    });
  };
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [fileData, setFileData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const updatedItems = [];
      const stockUpdates = [];

      const updateProductos = (productos, setProductos) => {
        const updated = productos.map((p) => {
          // const match = data.find(
          //   (row) =>
          //     row.Codebar?.toString().trim() === p.barcode?.toString().trim() ||
          //     row.IDProducto?.toString().trim() === p.barcode?.toString().trim()
          // );
          const match = data.find((row) => {
            const importCodebar = String(
              row.Codebar || row.IDProducto || ""
            ).trim();
            const productCodebar = String(p.barcode || "").trim();

            if (!importCodebar || importCodebar === "0") return false;
            return importCodebar === productCodebar;
          });

          if (match) {
            const newPrice = Number(match.Unitario);
            const newStock = Number(match.Cantidad);

            if (!isNaN(newPrice) && newPrice > 0) {
              updatedItems.push({
                name: p.name,
                old: p.currentPrice,
                new: newPrice,
                stock: !isNaN(newStock) ? newStock : undefined,
              });

              if (!isNaN(newStock) && selectedBranchId) {
                stockUpdates.push({ codebar: p.barcode, quantity: newStock });
              }

              return {
                ...p,
                currentPrice: newPrice,
                manualPrice: newPrice,
                discountedPrice: p.discount
                  ? Number((newPrice * (1 - p.discount / 100)).toFixed(2))
                  : newPrice,
                stock: !isNaN(newStock) ? newStock : 0, // <-- Agregamos stock aquí
              };
            }
          }

          return p;
        });

        setProductos(updated);
      };

      updateProductos(clasicos, setClasicos);
      updateProductos(especiales, setEspeciales);
      setUpdateResults(updatedItems);
      setFileData(data);

      // 👇 Llamada para actualizar stock en backend
      if (stockUpdates.length > 0 && selectedBranchId) {
        console.log("STOCK A ACTUALIZAR:", stockUpdates);
        await updateBulkStock(stockUpdates);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleActualizarPrecios = () => {
    let actualizados = 0;

    const actualizar = (lista, setLista) => {
      const nuevaLista = lista.map((p) => {
        const fila = fileData.find(
          (f) =>
            String(f.Codebar)?.trim() === String(p.barcode)?.trim() ||
            String(f.IDProducto)?.trim() === String(p.barcode)?.trim()
        );

        if (fila && fila.precio) {
          actualizados++;
          return {
            ...p,
            currentPrice: Number(fila.precio),
            manualPrice: undefined,
            manualPreviousPrice: undefined,
            discountedPrice:
              p.discount && p.discount > 0
                ? Number(
                    (Number(fila.precio) * (1 - p.discount / 100)).toFixed(2)
                  )
                : undefined, // si no hay descuento, se borra el precio con descuento
          };
        }
        return p;
      });

      setLista(nuevaLista);
    };

    actualizar(clasicos, setClasicos);
    actualizar(especiales, setEspeciales);

    // setOpenUpdateModal(false);
    alert(`Precios actualizados para ${actualizados} productos`);
  };
  console.log("Clasicos", clasicos);
  console.log("Especiales", especiales);

  const handleClearAll = () => {
    localStorage.removeItem("labels_clasicos");
    localStorage.removeItem("labels_especiales");
    setClasicos([]);
    setEspeciales([]);
    setFileData([]);
    setUpdateResults([]);
    setOpenClearDialog(false);
    alert("Se borraron todas las etiquetas y archivos cargados.");
  };
  console.log("selectedBranchId", selectedBranchId);

  const updateFromImport = async () => {
    if (!selectedBranchId) {
      alert("Seleccioná una sucursal primero");
      return null;
    }

    try {
      const response = await api.get(`/imports/latestApplied`, {
        params: { branchId: selectedBranchId },
      });
      console.log("RESPONSE", response);
      const importData = response;
      if (!importData) {
        alert("No se encontró importación aplicada para esta sucursal");
        return null;
      }

      setImportId(importData._id);
      return importData;
    } catch (error) {
      console.error("Error trayendo importación:", error);
      alert("Error al obtener la importación");
      return null;
    }
  };

  const handleFullImportUpdate = async () => {
    const importData = await updateFromImport();
    if (!importData) return;

    const productos = tabIndex === 0 ? clasicos : especiales;
    // const barcodes = productos
    //   .map((p) => p.barcode?.toString().trim())
    //   .filter((b) => b);

    const barcodes = productos
  .map((p) => p.barcode?.toString().trim())
  .filter((b) => b && b !== "0"); // evitar vacíos y 0

    if (barcodes.length === 0) {
      alert("No hay productos cargados para aplicar la importación.");
      return;
    }

    try {
      const res = await api.post("/imports/apply-to-products", {
        importId: importData._id,
        barcodes,
      });

      alert(`Actualización exitosa. ${res.updated} productos actualizados.`);
      console.log("res:", res);

      const updatedClasicos = clasicos.map((p) => {
        const match = res?.rows.find(
          (r) => r.barcode?.toString().trim() === p.barcode?.toString().trim()
        );
        if (!match) return p;

        return {
          ...p,
          currentPrice: match.price,
          manualPrice: match.price,
          discountedPrice: p.discount
            ? Number((match.price * (1 - p.discount / 100)).toFixed(2))
            : match.price,
          stock: typeof match.stock === "number" ? match.stock : p.stock,
        };
      });

      const updatedEspeciales = especiales.map((p) => {
        const match = res?.rows.find(
          (r) => r.barcode?.toString().trim() === p.barcode?.toString().trim()
        );
        if (!match) return p;

        return {
          ...p,
          currentPrice: match.price,
          manualPrice: match.price,
          discountedPrice: p.discount
            ? Number((match.price * (1 - p.discount / 100)).toFixed(2))
            : match.price,
          stock: typeof match.stock === "number" ? match.stock : p.stock,
        };
      });

      setClasicos(updatedClasicos);
      setEspeciales(updatedEspeciales);

      const stockUpdates = res.rows
        .filter((r) => typeof r.stock === "number" && r.stock >= 0)
        .map((r) => ({ codebar: r.barcode, quantity: r.stock }));

      if (stockUpdates.length > 0 && selectedBranchId) {
        await updateBulkStock(stockUpdates);
      }

      setUpdateResults(
        res.rows.map((r) => ({
          name: r.name,
          new: r.price,
          stock: r.stock,
        }))
      );
    } catch (error) {
      console.error("Error aplicando importación a productos:", error);
      alert("Error aplicando importación");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Generador de Etiquetas</Typography>
      <SucursalSelector />
      {/* Pestañas */}
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Etiquetas Clásicas" />
        <Tab label="Etiquetas Especiales" />
      </Tabs>
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {/* <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            📥 Actualizar desde Excel
          </Typography>
          <Typography variant="body2" mb={1}>
            Subí un archivo con precios y stock. Requiere columnas:{" "}
            <strong>Codebar</strong>, <strong>Unitario</strong> y{" "}
            <strong>Cantidad</strong>.
          </Typography>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Subir archivo Excel
          </Button>
        </Box> */}

        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            🔁 Aplicar importación reciente de precios y stocks
          </Typography>
          <Typography variant="body2" mb={1}>
            Usa la última importación aplicada a esta sucursal y actualiza solo
            los productos cargados.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFullImportUpdate}
          >
            Aplicar importación a productos cargados
          </Button>
        </Box>
      </Box>

      <Button
        variant="outlined"
        sx={{ mb: 2, ml: 2 }}
        onClick={() => setOpenDiscountModal(true)}
      >
        Cargar descuentos desde Excel
      </Button>
      <Button
        variant="outlined"
        color="error"
        sx={{ mb: 2, ml: 2 }}
        onClick={() => setOpenClearDialog(true)}
      >
        Borrar todas las etiquetas guardadas
      </Button>

      <ExcelDiscountUploader
        open={openDiscountModal}
        onClose={() => setOpenDiscountModal(false)}
        productos={tabIndex === 0 ? clasicos : especiales}
        setProductos={tabIndex === 0 ? setClasicos : setEspeciales}
        tipoEtiqueta={tabIndex === 0 ? "clasica" : "oferta"}
      />
      {tabIndex === 0 && (
        <Box>
          <ClasicasInput
            productos={clasicos}
            setProductos={setClasicos}
            generateBarcodeImage={generateBarcodeImage}
          />

          {/* 🟢 CLÁSICOS CON STOCK */}
          {clasicosConStock.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                Productos con stock:
              </Typography>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 1 }}
                onClick={() =>
                  generatePDF_Clasicas({ clasicos: clasicosConStock })
                }
              >
                Generar PDF (con stock)
              </Button>
            </>
          )}

          {/* 🔴 CLÁSICOS SIN STOCK */}
          {clasicosSinStock.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 4 }}>
                Productos sin stock:
              </Typography>
              <Button
                variant="contained"
                color="warning"
                sx={{ mt: 1 }}
                onClick={() =>
                  generatePDF_Clasicas({ clasicos: clasicosSinStock })
                }
              >
                Generar PDF (sin stock)
              </Button>
            </>
          )}
        </Box>
      )}


 {/* 🔧 Input para scale */}
      {tabIndex === 1 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Escala de impresión</Typography>
          <TextField
            type="number"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            inputProps={{ step: 0.1, min: 0.1, max: 3 }}
            size="small"
          />
        </Box>
      )}



      {tabIndex === 1 && (
        <Box>
          <EspecialesInput
            productos={especiales}
            setProductos={setEspeciales}
          />

          {/* 🟢 ESPECIALES CON STOCK */}
          {especialesConStock.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                Productos con stock:
              </Typography>
              <Grid container spacing={2} mt={1}>
                {especialesConStock.map((p, i) => (
                  <Grid item xs={12} md={6} key={`${p._id}-con`}>
                    <EtiquetaPreview
                      producto={p}
                      onChange={(field, value) =>
                        updateEspecialField(
                          especiales.findIndex((ep) => ep._id === p._id),
                          field,
                          value
                        )
                      }
                      onRemove={() =>
                        handleRemoveEspecial(
                          especiales.findIndex((ep) => ep._id === p._id)
                        )
                      }
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={() =>
                  generatePDF_Grandes({ especiales: especialesConStock, scale })
                }
              >
                Generar PDF (con stock)
              </Button>
            </>
          )}

          {/* 🔴 ESPECIALES SIN STOCK */}
          {especialesSinStock.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 4 }}>
                Productos sin stock:
              </Typography>
              <Grid container spacing={2} mt={1}>
                {especialesSinStock.map((p, i) => (
                  <Grid item xs={12} md={6} key={`${p._id}-sin`}>
                    <EtiquetaPreview
                      producto={p}
                      onChange={(field, value) =>
                        updateEspecialField(
                          especiales.findIndex((ep) => ep._id === p._id),
                          field,
                          value
                        )
                      }
                      onRemove={() =>
                        handleRemoveEspecial(
                          especiales.findIndex((ep) => ep._id === p._id)
                        )
                      }
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                color="warning"
                sx={{ mt: 2 }}
                onClick={() =>
                  generatePDF_Grandes({ especiales: especialesSinStock, scale })
                }
              >
                Generar PDF (sin stock)
              </Button>
            </>
          )}
        </Box>
      )}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Actualizar precios</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Subí un archivo Excel con las columnas <strong>Codebar</strong>,{" "}
            <strong>Unitario</strong> y <strong>Cantidad</strong>
          </Typography>

          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleActualizarPrecios}
            disabled={fileData.length === 0}
          >
            Aplicar precios del Excel
          </Button>

          {updateResults.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Productos actualizados:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Producto</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Precio anterior</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Precio nuevo</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Stock actualizado</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {updateResults.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">${item.old ?? "-"}</TableCell>
                      <TableCell align="right">${item.new ?? "-"}</TableCell>
                      <TableCell align="right">
                        {item.stock !== undefined ? item.stock : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openClearDialog} onClose={() => setOpenClearDialog(false)}>
        <DialogTitle>Confirmar borrado</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que querés borrar <strong>todas</strong> las
            etiquetas guardadas? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>Cancelar</Button>
          <Button color="error" onClick={handleClearAll}>
            Borrar todo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductLabelManager;
