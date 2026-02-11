// // ClasicasInput.jsx
// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Grid,
//   IconButton,
//   Paper,
//   TextField,
//   Typography,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import axios from "axios";

// const ClasicasInput = ({ productos, setProductos, generateBarcodeImage }) => {
//   const [barcodeInput, setBarcodeInput] = useState("");

//   const handleScan = async () => {
//     if (!barcodeInput.trim()) return;
//     try {
//       const response = await axios.get(
//         import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
//       );
//       const data = response.data;

//       const already = productos.find((p) => p._id === data._id);
//       if (!already) {
//         const price = data.currentPrice ?? 0;
//         setProductos((prev) => [
//           ...prev,
//           {
//             ...data,
//             manualPrice: null,
//             discount: 0,
//             discountedPrice: price,
//             tipoEtiqueta: "clasica",
//           },
//         ]);
//       } else {
//         alert("Producto ya agregado");
//       }
//     } catch (err) {
//       alert("Producto no encontrado");
//     } finally {
//       setBarcodeInput("");
//     }
//   };

//   const updateProductField = (index, field, value) => {
//     setProductos((prev) => {
//       const updated = [...prev];
//       updated[index][field] = value;

//       const base =
//         updated[index].manualPreviousPrice &&
//         updated[index].manualPreviousPrice > 0
//           ? updated[index].manualPreviousPrice
//           : updated[index].manualPrice && updated[index].manualPrice > 0
//           ? updated[index].manualPrice
//           : updated[index].currentPrice || 0;

//       const discount = updated[index].discount || 0;
//       updated[index].discountedPrice = Number(
//         (base * (1 - discount / 100)).toFixed(2)
//       );
//       return updated;
//     });
//   };

//   const handleDeleteProduct = (index) => {
//     setProductos((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <Box>
//       <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//         <TextField
//           label="Código de barras"
//           value={barcodeInput}
//           onChange={(e) => setBarcodeInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleScan()}
//           fullWidth
//         />
//         <Button variant="contained" onClick={handleScan}>
//           Buscar
//         </Button>
//       </Box>

//       <Grid container spacing={2}>
//         {productos.map((p, i) => {
//           const hasPriceError =
//             (!p.currentPrice || p.currentPrice <= 0) &&
//             (!p.manualPrice || p.manualPrice <= 0);

//           return (
//           <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>

//               <Paper
//                 sx={{
//                   minWidth: 280,
//                   maxWidth: 400,
//                   mx: "auto", // centra el Paper si sobra espacio
//                   p: 2,
//                   position: "relative",
//                   bgcolor: hasPriceError ? "#ffe5e5" : "#f9f9f9",
//                   border: hasPriceError
//                     ? "2px solid #d32f2f"
//                     : "1px solid #ddd",
//                 }}
//               >
//                 <IconButton
//                   size="small"
//                   color="error"
//                   onClick={() => handleDeleteProduct(i)}
//                   sx={{ position: "absolute", top: 4, right: 4 }}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//                 <Typography variant="subtitle1">{p.name}</Typography>

//                 {!p.currentPrice || p.currentPrice <= 0 ? (
//                   <TextField
//                     label="Precio"
//                     type="number"
//                     value={p.manualPrice || ""}
//                     onChange={(e) =>
//                       updateProductField(
//                         i,
//                         "manualPrice",
//                         Number(e.target.value)
//                       )
//                     }
//                     fullWidth
//                     sx={{
//                       mt: 1,
//                       bgcolor: hasPriceError ? "#ffe5e5" : undefined,
//                     }}
//                   />
//                 ) : (
//                   <Typography variant="body2">
//                     Precio actual: ${p.currentPrice.toFixed(2)}
//                   </Typography>
//                 )}

//                 <TextField
//                   label="% Descuento"
//                   type="number"
//                   value={p.discount}
//                   onChange={(e) =>
//                     updateProductField(i, "discount", Number(e.target.value))
//                   }
//                   fullWidth
//                   sx={{ mt: 1 }}
//                   InputLabelProps={{ shrink: true }}
//                 />
//                 <TextField
//                   label="Precio anterior"
//                   type="number"
//                   value={p.manualPreviousPrice ?? ""}
//                   onChange={(e) =>
//                     updateProductField(
//                       i,
//                       "manualPreviousPrice",
//                       Number(e.target.value)
//                     )
//                   }
//                   fullWidth
//                   sx={{ mt: 1 }}
//                    InputLabelProps={{ shrink: true }}
//                 />

//                 <Typography variant="body1" sx={{ mt: 1 }}>
//                   Precio final:{" "}
//                   <strong>${p.discountedPrice?.toFixed(2)}</strong>
//                 </Typography>
//               </Paper>
//             </Grid>
//           );
//         })}
//       </Grid>
//     </Box>
//   );
// };

// export default ClasicasInput;


// ClasicasInput.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";

const money = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calcDiscountedPrice = (p) => {
  const base =
    p.manualPreviousPrice && p.manualPreviousPrice > 0
      ? p.manualPreviousPrice
      : p.manualPrice && p.manualPrice > 0
      ? p.manualPrice
      : p.currentPrice || 0;

  const discount = Number(p.discount || 0);
  const final = base * (1 - discount / 100);

  return Number(final.toFixed(2));
};

const ClasicasInput = ({
  productos,
  setProductos,
  onPrint, // 👈 te lo dejo preparado para que imprimas desde el padre
}) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const allSelected = useMemo(() => {
    if (!productos.length) return false;
    return productos.every((p) => selectedIds.has(p._id));
  }, [productos, selectedIds]);

  const someSelected = useMemo(() => {
    if (!productos.length) return false;
    return productos.some((p) => selectedIds.has(p._id));
  }, [productos, selectedIds]);

  const handleScan = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
      );
      const data = response.data;

      const already = productos.find((p) => p._id === data._id);
      if (already) {
        alert("Producto ya agregado");
        return;
      }

      const price = data.currentPrice ?? 0;

      setProductos((prev) => [
        ...prev,
        {
          ...data,
          manualName: data.name,
          manualPrice: null,
          manualPreviousPrice: null,
          discount: 0,
          discountedPrice: price,
          tipoEtiqueta: "clasica",
        },
      ]);
    } catch (err) {
      alert("Producto no encontrado");
    } finally {
      setBarcodeInput("");
    }
  };

  const updateProductField = (index, field, value) => {
    setProductos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      updated[index].discountedPrice = calcDiscountedPrice(updated[index]);

      return updated;
    });
  };

  const handleDeleteProduct = (id) => {
    setProductos((prev) => prev.filter((p) => p._id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(productos.map((p) => p._id)));
  };

  const handlePrintSelected = () => {
    const selected = productos.filter((p) => selectedIds.has(p._id));
    if (!selected.length) return alert("No seleccionaste ningún producto");
    onPrint?.(selected);
  };

  const handlePrintAll = () => {
    if (!productos.length) return alert("No hay productos");
    onPrint?.(productos);
  };

  return (
    <Box>
      {/* BUSCADOR */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="Código de barras"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          fullWidth
        />
        <Button variant="contained" onClick={handleScan}>
          Buscar
        </Button>
      </Box>

      {/* BOTONES */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintAll}
          disabled={!productos.length}
        >
          Imprimir todos
        </Button>

        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrintSelected}
          disabled={!someSelected}
        >
          Imprimir seleccionados ({selectedIds.size})
        </Button>

        <Button
          variant="text"
          color="error"
          onClick={() => {
            if (!productos.length) return;
            const ok = confirm("¿Vaciar lista de etiquetas clásicas?");
            if (!ok) return;
            setProductos([]);
            setSelectedIds(new Set());
          }}
          disabled={!productos.length}
        >
          Vaciar lista
        </Button>
      </Stack>

      {/* TABLA */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onChange={toggleAll}
                />
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 130 }}>
                Precio actual
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 130 }}>
                Precio manual
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>
                % Desc.
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 140 }}>
                Precio anterior
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 140 }}>
                Precio final
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 70 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!productos.length ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography variant="body2" sx={{ py: 2, opacity: 0.7 }}>
                    No hay productos cargados.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productos.map((p, index) => {
                const hasPriceError =
                  (!p.currentPrice || p.currentPrice <= 0) &&
                  (!p.manualPrice || p.manualPrice <= 0);

                return (
                  <TableRow
                    key={p._id}
                    hover
                    sx={{
                      bgcolor: hasPriceError ? "#ffe5e5" : undefined,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.has(p._id)}
                        onChange={() => toggleOne(p._id)}
                      />
                    </TableCell>

                    {/* NOMBRE */}
                    <TableCell>
                      <TextField
                        value={p.manualName ?? p.name ?? ""}
                        onChange={(e) =>
                          updateProductField(index, "manualName", e.target.value)
                        }
                        fullWidth
                        size="small"
                        InputProps={{
                          sx: { fontWeight: 600 },
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        {p.barcode ? `Barcode: ${p.barcode}` : ""}
                      </Typography>
                    </TableCell>

                    {/* PRECIO ACTUAL */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            p.currentPrice && p.currentPrice > 0
                              ? "inherit"
                              : "error.main",
                        }}
                      >
                        ${money(p.currentPrice)}
                      </Typography>
                    </TableCell>

                    {/* PRECIO MANUAL */}
                    <TableCell>
                      <TextField
                        type="number"
                        value={p.manualPrice ?? ""}
                        onChange={(e) =>
                          updateProductField(
                            index,
                            "manualPrice",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        fullWidth
                        size="small"
                        error={hasPriceError}
                        placeholder={
                          !p.currentPrice || p.currentPrice <= 0
                            ? "Obligatorio"
                            : ""
                        }
                      />
                    </TableCell>

                    {/* DESCUENTO */}
                    <TableCell>
                      <TextField
                        type="number"
                        value={p.discount ?? 0}
                        onChange={(e) =>
                          updateProductField(
                            index,
                            "discount",
                            Number(e.target.value)
                          )
                        }
                        fullWidth
                        size="small"
                      />
                    </TableCell>

                    {/* PRECIO ANTERIOR */}
                    <TableCell>
                      <TextField
                        type="number"
                        value={p.manualPreviousPrice ?? ""}
                        onChange={(e) =>
                          updateProductField(
                            index,
                            "manualPreviousPrice",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                        fullWidth
                        size="small"
                      />
                    </TableCell>

                    {/* FINAL */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        ${money(p.discountedPrice)}
                      </Typography>
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProduct(p._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClasicasInput;
