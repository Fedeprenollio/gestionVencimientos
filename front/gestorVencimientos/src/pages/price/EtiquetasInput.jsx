
import React, { useState } from "react";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import axios from "axios";

const EtiquetasInput = ({
    title=null,
  productos = [],
  setProductos,

  // opcional: si querés que al agregar lo marque seleccionado
  selectedIds,
  setSelectedIds,

  // "clasica" o "especial"
  mode = "especial",
}) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      setLoading(true);

      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/products/${code}`
      );

      const data = response.data;

      // Evitar duplicado
      const already = productos.find((p) => p._id === data._id);
      if (already) {
        alert("Producto ya agregado");
        return;
      }

      const price = data.currentPrice ?? 0;

      const newProduct = {
        ...data,

        // edición en tabla
        manualName: null,
        manualPrice: null,
        manualPreviousPrice: null,

        // descuentos
        discount: 0,

        // solo especiales usan esto, pero no molesta que exista
        tipoEtiqueta: mode === "especial" ? "oferta" : "clasica",

        // precio final lo calculás en la tabla, pero lo dejamos por compatibilidad
        discountedPrice: price,
      };

      setProductos((prev) => [...prev, newProduct]);

      // opcional: lo selecciona automáticamente
      if (setSelectedIds) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.add(newProduct._id);
          return next;
        });
      }
    } catch (err) {
      alert("Producto no encontrado");
    } finally {
      setBarcodeInput("");
      setLoading(false);
    }
  };
return (
  <Box sx={{ mb: 2 }}>
    {title && (
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5">{title}</Typography>
        <Divider sx={{ mt: 0.5 }} />
      </Box>
    )}

    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        label="Código de barras"
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleScan()}
        fullWidth
        disabled={loading}
      />

      <Button
        variant="contained"
        onClick={handleScan}
        disabled={loading || !barcodeInput.trim()}
      >
        {loading ? "Buscando..." : "Buscar"}
      </Button>
    </Box>
  </Box>
);

//   return (
//     <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//         {title && (
//                 <>
//                   <Typography variant="h6" sx={{ mb: 1 }}>
//                     {title}
//                   </Typography>
//                   <Divider sx={{ mb: 2 }} />
//                 </>
//               )}
//       <TextField
//         label="Código de barras"
//         value={barcodeInput}
//         onChange={(e) => setBarcodeInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleScan()}
//         fullWidth
//         disabled={loading}
//       />

//       <Button
//         variant="contained"
//         onClick={handleScan}
//         disabled={loading || !barcodeInput.trim()}
//       >
//         {loading ? "Buscando..." : "Buscar"}
//       </Button>
//     </Box>
//   );
};

export default EtiquetasInput;
