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
        {productos.map((p, i) => (
          <Grid item xs={12} md={6} key={p._id}>
            <Paper
              sx={{
                p: 2,
                position: "relative",
                bgcolor: "#f9f9f9", // color neutro claro
                border: "1px solid #ddd", // borde suave
                boxShadow: "none", // sin sombra
              }}
            >
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteProduct(i)}
                sx={{ position: "absolute", top: 4, right: 4 }}
              >
                <DeleteIcon />
              </IconButton>

              <TextField
                label="Nombre del producto"
                value={p.manualName}
                onChange={(e) =>
                  updateProductField(i, "manualName", e.target.value)
                }
                fullWidth
              />

              {!p.currentPrice || p.currentPrice <= 0 ? (
                <TextField
                size="small"
                 sx={{ mt: 0.5 }}
                  label="Precio"
                  type="number"
                  value={p.manualPrice || ""}
                  onChange={(e) =>
                    updateProductField(i, "manualPrice", Number(e.target.value))
                  }
                  fullWidth
                 
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
                Precio final: <strong>${p.discountedPrice?.toFixed(2)}</strong>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EspecialesInput;
