// // EspecialesInput.jsx
// import React, { useState } from "react";
// import { Box, Button, TextField } from "@mui/material";
// import axios from "axios";

// const EspecialesInput = ({ productos, setProductos }) => {
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
//             tipoEtiqueta: "oferta", // default tipo
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

//   return (
//     <Box sx={{ my: 2, display: "flex", gap: 1 }}>
//       <TextField
//         label="Código de barras"
//         value={barcodeInput}
//         onChange={(e) => setBarcodeInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleScan()}
//         fullWidth
//       />
//       <Button variant="contained" onClick={handleScan}>
//         Buscar
//       </Button>
//     </Box>
//   );
// };

// export default EspecialesInput;

import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const EspecialesInput = ({ productos, setProductos }) => {
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleScan = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${barcodeInput.trim()}`
      );
      const data = response.data;

      const already = productos.find((p) => p._id === data._id);
      if (!already) {
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
            tipoEtiqueta: "oferta",
          },
        ]);
      } else {
        alert("Producto ya agregado");
      }
    } catch (err) {
      alert("Producto no encontrado");
    } finally {
      setBarcodeInput("");
    }
  };

  const updateProductField = (index, field, value) => {
    setProductos((prev) => {
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

  const handleDeleteProduct = (index) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box sx={{ my: 2, display: "flex", gap: 1 }}>
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

      <Grid container spacing={2}>
        {productos.map((p, i) => {
          const hasPriceError =
            (!p.currentPrice || p.currentPrice <= 0) &&
            (!p.manualPrice || p.manualPrice <= 0);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
              <Paper
                sx={{
                  p: 2,
                  position: "relative",
                  bgcolor: hasPriceError ? "#ffe5e5" : "#f9f9f9",
                  border: hasPriceError
                    ? "2px solid #d32f2f"
                    : "1px solid #ddd",
                  boxShadow: "none", // sin sombra
                  minWidth: 280,
                  maxWidth: 400,
                  mx: "auto", // centra el Paper si sobra espacio
                }}
              >
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteProduct(i)}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    bgcolor: "#fff",
                    border: "1px solid #ddd",
                    zIndex: 10,
                    "&:hover": {
                      bgcolor: "#fdd",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <TextField
                  label="Nombre del producto"
                  value={p.manualName ?? p.name ?? ""}
                  onChange={(e) =>
                    updateProductField(i, "manualName", e.target.value)
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    style: {
                      fontSize: "14px",
                      fontWeight: 500,
                      textAlign: "center",
                    },
                  }}
                />

                {!p.currentPrice || p.currentPrice <= 0 ? (
                  <TextField
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: hasPriceError ? "#ffe5e5" : undefined,
                    }}
                    label="Precio"
                    type="number"
                    value={p.manualPrice ?? ""}
                    onChange={(e) =>
                      updateProductField(
                        i,
                        "manualPrice",
                        Number(e.target.value)
                      )
                    }
                    fullWidth
                    error={hasPriceError}
                  />
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Precio actual: ${p.currentPrice.toFixed(2)}
                  </Typography>
                )}

                <TextField
                  size="small"
                  sx={{ mt: 0.5 }}
                  label="% Descuento"
                  type="number"
                  value={p.discount}
                  onChange={(e) =>
                    updateProductField(i, "discount", Number(e.target.value))
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  sx={{ mt: 0.5 }}
                  label="Precio anterior"
                  type="number"
                  value={p.manualPreviousPrice ?? ""}
                  onChange={(e) =>
                    updateProductField(
                      i,
                      "manualPreviousPrice",
                      Number(e.target.value)
                    )
                  }
                  fullWidth
                />

                <Typography variant="body1" sx={{ mt: 1 }}>
                  Precio final:{" "}
                  <strong>${p.discountedPrice?.toFixed(2)}</strong>
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EspecialesInput;
