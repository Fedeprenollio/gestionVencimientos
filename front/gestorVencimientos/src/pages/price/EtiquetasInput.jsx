

import React, { useState } from "react";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import axios from "axios";

const EtiquetasInput = ({
  importId,
  selectedBranchId,
  title = null,
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
    const rows = barcodeInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (rows.length === 0) return;

    // Map: barcode -> discount
    const discountMap = new Map();

    const codes = [];

    for (const line of rows) {
      // Soporta:
      // 779... 15
      // 779...\t15 (excel)
      // 779...,15
      const parts = line.split(/[\s\t,;]+/).filter(Boolean);

      const code = parts?.[0]?.trim();
      if (!code) continue;

      let dto = 0;
      if (parts.length >= 2) {
        let rawDto = String(parts[1]).trim();

        // soporta "25%"
        rawDto = rawDto.replace("%", "").trim();

        dto = Number(rawDto);
        if (dto > 0 && dto <= 1) dto = dto * 100;
        if (!Number.isFinite(dto) || dto < 0 || dto >= 100) dto = 0;
      }

      codes.push(code);
      discountMap.set(code, dto);
    }

    if (codes.length === 0) return;

    try {
      setLoading(true);

      const response = await axios.post(
        import.meta.env.VITE_API_URL + `/products/by-codebars-with-import`,
        {
          importId,
          branchId: selectedBranchId,
          codebars: codes,
        },
      );

      const payload = response.data;
      const found = payload?.found || [];
      const notFound = payload?.notFound || [];

      if (found.length === 0) {
        alert("No se encontró ningún producto.");
        return;
      }

      const nuevos = [];

      for (const item of found) {
        if (!item?.product) continue;

        const product = item.product;
        const importRow = item.importRow;
        const missingInImport = !importRow;

        const codeSearched = item.codeSearched;

        // dto pegado en textarea
        const dto = discountMap.get(codeSearched) || 0;

        // precio base: SIEMPRE el del import si existe
        const basePrice =
          typeof importRow?.price === "number"
            ? importRow.price
            : (product.currentPrice ?? 0);

        const discountedPrice =
          dto > 0
            ? Number((basePrice * (1 - dto / 100)).toFixed(2))
            : basePrice;

        const data = {
          ...product,

          // 🔥 stock y precio del import si existe
          stock:
            typeof importRow?.stock === "number"
              ? importRow.stock
              : product.stock,

          currentPrice: basePrice,
        };

        // Evitar duplicado
        const already = productos.find(
          (p) => String(p._id) === String(data._id),
        );
        if (already) continue;

        const newProduct = {
          ...data,

          manualName: null,
          manualPrice: null,
          manualPreviousPrice: null,

          discount: dto,
          discountedPrice,

          tipoEtiqueta: mode === "especial" ? "oferta" : "clasica",
          __isNew: true, // 👈 NIVEL DIOS
           __missingInImport: missingInImport,
        };

        nuevos.push(newProduct);
      }

      if (nuevos.length > 0) {
        // setProductos((prev) => [...prev, ...nuevos]);
        const newIds = nuevos.map((p) => String(p._id));

        setProductos((prev) => [...nuevos, ...prev]);

        setTimeout(() => {
          setProductos((prev) =>
            prev.map((p) =>
              newIds.includes(String(p._id)) ? { ...p, __isNew: false } : p,
            ),
          );
        }, 2000);

        if (setSelectedIds) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const p of nuevos) next.add(p._id);
            return next;
          });
        }
      }

      if (notFound.length > 0) {
        console.log("❌ No encontrados:", notFound);
      }
    } catch (err) {
      console.error(err);
      alert("Error buscando productos");
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

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <TextField
          label="Códigos de barras (1 por línea)"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          multiline
          minRows={4}
          fullWidth
          disabled={loading}
        />

        <Button
          variant="contained"
          onClick={handleScan}
          disabled={loading || barcodeInput.trim().length === 0}
          sx={{ height: 56 }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </Box>
    </Box>
  );
};

export default EtiquetasInput;
