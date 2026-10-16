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
  Checkbox,
  Paper,
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
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { Select, MenuItem } from "@mui/material";
import EtiquetasTable from "./EtiquetasTable";
import EtiquetasInput from "./EtiquetasInput";

const ProductLabelManager = () => {
  const [latestImport, setLatestImport] = useState(null);

  const [tipoVista, setTipoVista] = useState("clasicas");
  // "clasicas" | "especiales"

  const [selectedEspeciales, setSelectedEspeciales] = useState(() => new Set());
  const [clasicas, setClasicas] = useState(() => {
    const saved = localStorage.getItem("labels_clasicos");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedClasicas, setSelectedClasicas] = useState(new Set());
  const { updateBulkStock } = useStockStore();

  const [especiales, setEspeciales] = useState(() => {
    const saved = localStorage.getItem("labels_especiales");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("labels_clasicos", JSON.stringify(clasicas));
  }, [clasicas]);

  // const [tabIndex, setTabIndex] = useState(0); // Estado para la pestaña activa
  // Nuevo estado
  const [openModal, setOpenModal] = useState(false);
  const [updateResults, setUpdateResults] = useState([]);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [scale, setScale] = useState(1); // valor por defecto = 1

  const { selectedBranchId } = useBranchStore();
  // const clasicasConStock = clasicas.filter((p) => Number(p.stock) > 0);
  // const clasicasSinStock = clasicas.filter(
  //   (p) => !p.stock || Number(p.stock) <= 0,
  // );

  //    CONTROL DE STOCK MANUAL
  const [codigosManuales, setCodigosManuales] = useState("");
  const [productosManuales, setProductosManuales] = useState([]);
  const [seleccionManual, setSeleccionManual] = useState(new Set());

  const normalizarCodigo = (codigo) =>
    String(codigo ?? "")
      .trim()
      .replace(/\s/g, "");

  
const buscarProductosManuales = () => {
  const codigos = [
    ...new Set(
      codigosManuales
        .split(/[\n\r\t,; ]+/)
        .map(normalizarCodigo)
        .filter(Boolean)
    ),
  ];

  const lista = tipoVista === "clasicas" ? clasicas : especiales;

  const encontrados = [];
  const noEncontrados = [];

  codigos.forEach((codigo) => {
    const producto = lista.find((p) => {
      const codigosProducto = [
        p.barcode,
        p.ean,
        ...(Array.isArray(p.alternateBarcodes)
          ? p.alternateBarcodes
          : []),
      ]
        .map(normalizarCodigo)
        .filter(Boolean);

      return codigosProducto.includes(codigo);
    });

    if (producto) {
      if (!encontrados.some((p) => p._id === producto._id)) {
        encontrados.push(producto);
      }
    } else {
      noEncontrados.push(codigo);
    }
  });

  setProductosManuales(encontrados);

  // Marcar los productos encontrados en la tabla original,
  // conservando los que ya estaban seleccionados.
  if (tipoVista === "clasicas") {
    setSelectedClasicas((prev) => {
      const next = new Set(prev);
      encontrados.forEach((p) => next.add(p._id));
      return next;
    });
  } else {
    setSelectedEspeciales((prev) => {
      const next = new Set(prev);
      encontrados.forEach((p) => next.add(p._id));
      return next;
    });
  }

  if (noEncontrados.length > 0) {
    alert(
      `No se encontraron ${noEncontrados.length} códigos en la lista de etiquetas ${
        tipoVista === "clasicas" ? "clásicas" : "especiales"
      }:\n\n${noEncontrados.join("\n")}`
    );
  }
};


  const imprimirSeleccionManual = () => {
    const seleccionados = productosManuales
      .filter((p) => seleccionManual.has(p.barcode))
      // El escaneo confirma que el producto está físicamente presente.
      .map((p) => ({
        ...p,
        stock: Math.max(Number(p.stock) || 0, 1),
      }));

    if (seleccionados.length === 0) {
      alert("Seleccioná al menos un producto.");
      return;
    }

    if (tipoVista === "clasicas") {
      generatePDF_Clasicas({
        clasicos: seleccionados,
        scale,
      });
    } else {
      generatePDF_Grandes({
        especiales: seleccionados,
        scale,
      });
    }
  };

  useEffect(() => {
    localStorage.setItem("labels_especiales", JSON.stringify(especiales));
  }, [especiales]);

  // const handleRemoveEspecial = (index) => {
  //   setEspeciales((prev) => prev.filter((_, i) => i !== index));
  // };
  // const toggleSelectEspecial = (id) => {
  //   setSelectedEspeciales((prev) => {
  //     const copy = new Set(prev);
  //     if (copy.has(id)) copy.delete(id);
  //     else copy.add(id);
  //     return copy;
  //   });
  // };

  // const selectAllEspeciales = () => {
  //   setSelectedEspeciales(new Set(especiales.map((p) => p._id)));
  // };

  // const clearSelectedEspeciales = () => {
  //   setSelectedEspeciales(new Set());
  // };

  // const updateEspecialField = (index, field, value) => {
  //   console.log(
  //     "updateEspecialField -> index:",
  //     index,
  //     "field:",
  //     field,
  //     "value:",
  //     value,
  //   );

  //   setEspeciales((prev) => {
  //     if (index < 0) {
  //       console.warn(
  //         "No se encontró el producto para actualizar",
  //         field,
  //         value,
  //       );
  //       return prev;
  //     }
  //     const updated = [...prev];
  //     updated[index][field] = value;

  //     const base =
  //       updated[index].manualPreviousPrice &&
  //       updated[index].manualPreviousPrice > 0
  //         ? updated[index].manualPreviousPrice
  //         : updated[index].manualPrice && updated[index].manualPrice > 0
  //           ? updated[index].manualPrice
  //           : updated[index].currentPrice || 0;

  //     const discount = updated[index].discount || 0;
  //     updated[index].discountedPrice = Number(
  //       (base * (1 - discount / 100)).toFixed(2),
  //     );

  //     return updated;
  //   });
  // };
  // const handleTabChange = (event, newValue) => {
  //   setTabIndex(newValue);
  // };

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
              row.Codebar || row.IDProducto || "",
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
            String(f.IDProducto)?.trim() === String(p.barcode)?.trim(),
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
                    (Number(fila.precio) * (1 - p.discount / 100)).toFixed(2),
                  )
                : undefined, // si no hay descuento, se borra el precio con descuento
          };
        }
        return p;
      });

      setLista(nuevaLista);
    };

    actualizar(clasicas, setClasicas);
    actualizar(especiales, setEspeciales);

    // setOpenUpdateModal(false);
    alert(`Precios actualizados para ${actualizados} productos`);
  };

  const handleClearAll = () => {
    localStorage.removeItem("labels_clasicos");
    localStorage.removeItem("labels_especiales");
    setClasicas([]);
    setEspeciales([]);
    setFileData([]);
    setUpdateResults([]);
    setOpenClearDialog(false);
    // alert("Se borraron todas las etiquetas y archivos cargados.");
  };

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

      // setImportId(importData._id);
      setLatestImport(importData);
      return importData;
    } catch (error) {
      console.error("Error trayendo importación:", error);
      alert("Error al obtener la importación");
      return null;
    }
  };

  useEffect(() => {
    if (selectedBranchId) {
      updateFromImport();
    }
  }, [selectedBranchId]);

  const handleFullImportUpdate = async () => {
    const importData = await updateFromImport();
    console.log("importData", importData);
    if (!importData) return;

    const productos = tipoVista === "clasicas" ? clasicas : especiales;

    const barcodes = productos
      .map((p) => p.barcode?.toString().trim())
      .filter((b) => b && b !== "0");

    if (barcodes.length === 0) {
      alert("No hay productos cargados para aplicar la importación.");
      return;
    }

    try {
      const res = await api.post("/imports/apply-to-products", {
        importId: importData._id,
        barcodes,
      });

      const rows = res.rows || [];

      alert(`Actualización exitosa. ${res.updated} productos actualizados.`);
      console.log("res:", res);

      // 🔥 helper para matchear sin repetir código
      const findMatch = (p) => {
        let match = rows.find((r) => String(r.productId) === String(p._id));

        if (!match) {
          match = rows.find(
            (r) =>
              r.barcode === p.barcode ||
              (Array.isArray(p.alternateBarcodes) &&
                p.alternateBarcodes.includes(r.barcode)),
          );
        }

        return match;
      };

      const updatedList = productos.map((p) => {
        const match = findMatch(p);
        if (!match) return p;

        const price = match.price;

        const discounted =
          tipoVista === "especiales" && p.discount
            ? Number((price * (1 - p.discount / 100)).toFixed(2))
            : price;

        return {
          ...p,
          currentPrice: price,
          manualPrice: price,
          discountedPrice: discounted,
          stock: typeof match.stock === "number" ? match.stock : p.stock,
        };
      });

      // 🔥 setear la lista correcta
      if (tipoVista === "especiales") setEspeciales(updatedList);
      else setClasicas(updatedList);

      // actualizar stock backend
      const stockUpdates = rows
        .filter((r) => typeof r.stock === "number" && r.stock >= 0)
        .map((r) => ({ codebar: r.barcode, quantity: r.stock }));

      if (stockUpdates.length > 0 && selectedBranchId) {
        await updateBulkStock(stockUpdates);
      }

      setUpdateResults(
        rows.map((r) => ({
          name: r.name,
          new: r.price,
          stock: r.stock,
        })),
      );
    } catch (error) {
      console.error("Error aplicando importación a productos:", error);
      alert("Error aplicando importación");
    }
  };

  
const seleccionarConStock = () => {
  const lista = tipoVista === "clasicas" ? clasicas : especiales;

  const idsConStock = lista
    .filter((p) => Number(p.stock) > 0)
    .map((p) => p._id);

  if (tipoVista === "clasicas") {
    setSelectedClasicas(new Set(idsConStock));
  } else {
    setSelectedEspeciales(new Set(idsConStock));
  }

  alert(
    `Se seleccionaron ${idsConStock.length} productos con stock registrado.`
  );
};

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5">Generador de Etiquetas</Typography>
        <SucursalSelector />
      </Paper>

      <ExcelDiscountUploader
        open={openDiscountModal}
        onClose={() => setOpenDiscountModal(false)}
        // productos={tabIndex === 0 ? clasicos : especiales}
        // setProductos={tabIndex === 0 ? setClasicos : setEspeciales}
        // tipoEtiqueta={tabIndex === 0 ? "clasica" : "oferta"}
        productos={tipoVista === "clasicas" ? clasicas : especiales}
        setProductos={tipoVista === "clasicas" ? setClasicas : setEspeciales}
        tipoEtiqueta={tipoVista === "clasicas" ? "clasica" : "oferta"}
        importId={latestImport?._id}
      />

      {/* SELECT para elegir tipo */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        {/* <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}> */}
        <Typography sx={{ fontWeight: 700 }}>Tipo de etiquetas:</Typography>

        <Select
          size="small"
          value={tipoVista}
          onChange={(e) => setTipoVista(e.target.value)}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="clasicas">Etiquetas Clásicas</MenuItem>
          <MenuItem value="especiales">Etiquetas Especiales</MenuItem>
        </Select>

        <Button
          variant="outlined"
          sx={{ mb: 2, ml: 2 }}
          onClick={() => setOpenDiscountModal(true)}
        >
          Cargar descuentos desde Excel
        </Button>
      </Paper>


<Paper elevation={3} sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6" gutterBottom>
    Selección manual por código de barras
  </Typography>

  <Typography variant="body2" sx={{ mb: 1 }}>
    Escaneá los productos que tenés físicamente en la sucursal
    o pegá los códigos, uno por línea. Después elegí cuáles
    querés imprimir.
  </Typography>

  <TextField
    fullWidth
    multiline
    minRows={4}
    maxRows={8}
    label="Códigos de barras"
    placeholder={"7791234567890\n7799876543210"}
    value={codigosManuales}
    onChange={(e) => setCodigosManuales(e.target.value)}
    sx={{ mb: 2 }}
  />

  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
    <Button
      variant="contained"
      onClick={buscarProductosManuales}
    >
      Buscar productos
    </Button>

    <Button
      variant="outlined"
      onClick={() => {
        setCodigosManuales("");
        setProductosManuales([]);
        setSeleccionManual(new Set());
      }}
    >
      Limpiar
    </Button>
  </Box>

  {productosManuales.length > 0 && (
    <>
      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Productos encontrados: {productosManuales.length}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Button
          size="small"
          onClick={() =>
            setSeleccionManual(
              new Set(productosManuales.map((p) => p.barcode))
            )
          }
        >
          Seleccionar todos
        </Button>

        <Button
          size="small"
          onClick={() => setSeleccionManual(new Set())}
        >
          Deseleccionar todos
        </Button>
      </Box>

      {productosManuales.map((p) => (
        <Box
          key={p.barcode}
          sx={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Checkbox
            checked={seleccionManual.has(p.barcode)}
            onChange={(e) => {
              setSeleccionManual((prev) => {
                const next = new Set(prev);

                if (e.target.checked) {
                  next.add(p.barcode);
                } else {
                  next.delete(p.barcode);
                }

                return next;
              });
            }}
          />

          <Box sx={{ flex: 1, py: 1 }}>
            <Typography variant="body2">
              {p.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Código: {p.barcode}
            </Typography>
          </Box>

          <Chip
            size="small"
            label="Escaneado"
            color="success"
            variant="outlined"
          />
        </Box>
      ))}

      <Button
        fullWidth
        variant="contained"
        color="success"
        sx={{ mt: 2 }}
        onClick={imprimirSeleccionManual}
        disabled={seleccionManual.size === 0}
      >
        Imprimir seleccionados ({seleccionManual.size})
      </Button>
    </>
  )}
</Paper>


      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        {tipoVista === "especiales" && (
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

        {tipoVista === "clasicas" && (
          <>
            <EtiquetasInput
              title="Etiquetas Clásicas"
              productos={clasicas}
              setProductos={setClasicas}
              selectedIds={selectedClasicas}
              setSelectedIds={setSelectedClasicas}
              mode="clasica"
              selectedBranchId={selectedBranchId}
              importId={latestImport?._id}
            />

            <Divider sx={{ my: 2 }} />

            <EtiquetasTable
              handleFullImportUpdate={handleFullImportUpdate}
              setOpenClearDialog={setOpenClearDialog}
              title="Etiquetas Clásicas"
              productos={clasicas}
              setProductos={setClasicas}
              selectedIds={selectedClasicas}
              setSelectedIds={setSelectedClasicas}
              showTipoEtiqueta={false}
              allowPrintConStock={true}
              allowPrintSinStock={true}
              onPrintSelected={(selected) =>
                generatePDF_Clasicas({ clasicos: selected, scale })
              }
              onPrintAll={(all) =>
                generatePDF_Clasicas({ clasicos: all, scale })
              }
              onPrintConStock={(list) =>
                generatePDF_Clasicas({ clasicos: list })
              }
              onPrintSinStock={(list) =>
                generatePDF_Clasicas({ clasicos: list })
              }
            />
          </>
        )}

        {tipoVista === "especiales" && (
          <>
            <EtiquetasInput
              title="Etiquetas Especiales"
              setOpenClearDialog={setOpenClearDialog}
              productos={especiales}
              setProductos={setEspeciales}
              selectedIds={selectedEspeciales}
              setSelectedIds={setSelectedEspeciales}
              mode="especial"
              selectedBranchId={selectedBranchId}
              importId={latestImport?._id}
            />

            <Divider sx={{ my: 2 }} />

            <EtiquetasTable
              handleFullImportUpdate={handleFullImportUpdate}
              setOpenClearDialog={setOpenClearDialog}
              title="Etiquetas Especiales"
              productos={especiales}
              setProductos={setEspeciales}
              selectedIds={selectedEspeciales}
              setSelectedIds={setSelectedEspeciales}
              showTipoEtiqueta={true}
              allowPrintConStock={true}
              allowPrintSinStock={true}
              onPrintSelected={(selected) =>
                generatePDF_Grandes({ especiales: selected, scale })
              }
              onPrintAll={(all) =>
                generatePDF_Grandes({ especiales: all, scale })
              }
              onPrintConStock={(list) =>
                generatePDF_Grandes({ especiales: list, scale })
              }
              onPrintSinStock={(list) =>
                generatePDF_Grandes({ especiales: list, scale })
              }
            />
          </>
        )}
      </Paper>

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
