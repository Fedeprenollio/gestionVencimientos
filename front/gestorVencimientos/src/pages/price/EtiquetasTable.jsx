// EtiquetasTable.jsx
import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

const EtiquetasTable = ({
  handleFullImportUpdate,
  setOpenClearDialog,
  title = null,

  productos = [],
  setProductos,

  selectedIds,
  setSelectedIds,

  // ---- comportamiento
  showTipoEtiqueta = false, // si false NO se muestra la columna "Etiqueta"
  allowPrintConStock = false, // solo para especiales
  allowPrintSinStock = false, // solo para especiales

  // ---- acciones de impresión
  onPrintSelected,
  onPrintAll,
  onPrintConStock,
  onPrintSinStock,
}) => {
  const discountRefs = useRef([]);
  console.log("PRODUCTOS, p", productos);
  const [search, setSearch] = useState("");

  // =========================
  // Helpers
  // =========================
  const safeNumber = (v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const calcBasePrice = (p) => {
    if (p.manualPreviousPrice && p.manualPreviousPrice > 0)
      return safeNumber(p.manualPreviousPrice);

    if (p.manualPrice && p.manualPrice > 0) return safeNumber(p.manualPrice);

    return safeNumber(p.currentPrice || 0);
  };

  const calcFinalPrice = (p) => {
    const base = calcBasePrice(p);
    const discount = safeNumber(p.discount || 0);
    if (discount > 0) return Number((base * (1 - discount / 100)).toFixed(2));
    return Number(base.toFixed(2));
  };

  // =========================
  // Filtro por búsqueda
  // =========================
  const productosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productos;

    return productos.filter((p) => {
      const name = String(p.manualName ?? p.name ?? "").toLowerCase();
      const barcode = String(p.barcode ?? "").toLowerCase();
      const type = String(p.type ?? "").toLowerCase();

      return (
        name.includes(q) ||
        barcode.includes(q) ||
        type.includes(q) ||
        String(p._id ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [productos, search]);

  // =========================
  // Listas derivadas
  // =========================
  const conStock = useMemo(
    () =>
      productosFiltrados.filter((p) => {
        const s = Number(p.stock);
        return !isNaN(s) && s > 0;
      }),
    [productosFiltrados],
  );

  const sinStock = useMemo(
    () =>
      productosFiltrados.filter((p) => {
        const s = Number(p.stock);
        return isNaN(s) || s <= 0;
      }),
    [productosFiltrados],
  );

  const selectedCount = selectedIds?.size || 0;

  // =========================
  // Selección
  // =========================
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 👇 Selecciona SOLO lo filtrado (lo más útil)
  const selectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      productosFiltrados.forEach((p) => next.add(p._id));
      return next;
    });
  };

  const clearSelected = () => {
    setSelectedIds(new Set());
  };

  // =========================
  // Update fields
  // =========================

  const updateField = (index, field, value) => {
    setProductos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      const p = updated[index];

      const base =
        p.manualPreviousPrice && Number(p.manualPreviousPrice) > 0
          ? Number(p.manualPreviousPrice)
          : p.manualPrice && Number(p.manualPrice) > 0
            ? Number(p.manualPrice)
            : Number(p.currentPrice) || 0;

      const discount = Number(p.discount) || 0;

      updated[index].discountedPrice = Number(
        (base * (1 - discount / 100)).toFixed(2),
      );

      return updated;
    });
  };
  const updateFieldById = (productId, field, value) => {
    setProductos((prev) => {
      const idx = prev.findIndex((x) => String(x._id) === String(productId));
      if (idx < 0) return prev;

      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      const p = updated[idx];

      const base =
        p.manualPreviousPrice && Number(p.manualPreviousPrice) > 0
          ? Number(p.manualPreviousPrice)
          : p.manualPrice && Number(p.manualPrice) > 0
            ? Number(p.manualPrice)
            : Number(p.currentPrice) || 0;

      const discount = Number(p.discount) || 0;

      updated[idx].discountedPrice = Number(
        (base * (1 - discount / 100)).toFixed(2),
      );

      return updated;
    });
  };

  const removeProduct = (indexInFiltered) => {
    const removed = productosFiltrados[indexInFiltered];
    if (!removed?._id) return;

    setProductos((prev) =>
      prev.filter((p) => String(p._id) !== String(removed._id)),
    );

    // también lo sacamos de la selección si estaba seleccionado
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(removed._id);
      return next;
    });
  };

  // =========================
  // UI
  // =========================
  if (!productos) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* {title && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )} */}

      {/* BUSCADOR */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          label="Buscar (nombre / barcode / tipo)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => setSearch("")}
          disabled={!search.trim()}
        >
          Limpiar
        </Button>
      </Box>

      {/* RESUMEN + BOTONES */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Total: ${productosFiltrados.length}`}
            color="primary"
            variant="outlined"
          />

          {allowPrintConStock && (
            <Chip
              label={`Con stock: ${conStock.length}`}
              color="success"
              variant="outlined"
            />
          )}

          {allowPrintSinStock && (
            <Chip
              label={`Sin stock: ${sinStock.length}`}
              color="warning"
              variant="outlined"
            />
          )}
        </Box>

        {/* <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            🔁 ACTUALIZAR precios y stocks
          </Typography>
          <Typography variant="body2" mb={1}>
            Usa la última importación de stock descagado desde plex y aplicada a
            esta sucursal .
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFullImportUpdate}
          >
            Aplicar importación a productos cargados
          </Button>
        </Box> */}

        {/* Botones */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="error"
            sx={{ mb: 2, ml: 2 }}
            onClick={() => setOpenClearDialog(true)}
          >
            Borrar todas las etiquetas guardadas
          </Button>
          <Button
            variant="contained"
            disabled={selectedCount === 0}
            onClick={() => {
              const selected = productos.filter((p) => selectedIds.has(p._id));
              onPrintSelected?.(selected);
            }}
          >
            Imprimir seleccionados ({selectedCount})
          </Button>

          <Button
            variant="outlined"
            onClick={() => onPrintAll?.(productosFiltrados)}
            disabled={productosFiltrados.length === 0}
          >
            Imprimir todos
          </Button>

          <Button
            variant="outlined"
            onClick={selectAll}
            disabled={productosFiltrados.length === 0}
          >
            Seleccionar todos
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={clearSelected}
            disabled={selectedCount === 0}
          >
            Limpiar selección
          </Button>

          {allowPrintConStock && conStock.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onPrintConStock?.(conStock)}
            >
              Generar PDF (con stock)
            </Button>
          )}

          {allowPrintSinStock && sinStock.length > 0 && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => onPrintSinStock?.(sinStock)}
            >
              Generar PDF (sin stock)
            </Button>
          )}
        </Box>
      </Box>

      {/* TABLA */}
      {productosFiltrados.length === 0 ? (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          No hay productos cargados todavía.
        </Typography>
      ) : (
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fafafa" }}>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  ✔
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Producto</TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Precio
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Precio ant.
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Desc. %
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Final
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Stock
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Estado
                </TableCell>

                {showTipoEtiqueta && (
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Etiqueta
                  </TableCell>
                )}

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {productosFiltrados.map((p, index) => {
                const finalPrice = calcFinalPrice(p);
                const hasStock =
                  typeof p.stock === "number" ? p.stock > 0 : false;

                return (
                  <TableRow
                    key={p._id}
                    sx={{
                      transition: "background-color 0.6s ease",
                      backgroundColor: p.__isNew
                        ? "rgba(255, 235, 59, 0.35)"
                        : p.__missingInImport
                          ? "rgba(244, 67, 54, 0.10)"
                          : "transparent",

                      borderLeft: p.__missingInImport
                        ? "4px solid rgba(244, 67, 54, 0.6)"
                        : "none",
                    }}
                    hover
                  >
                    {/* CHECK */}
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedIds.has(p._id)}
                        onChange={() => toggleSelect(p._id)}
                      />
                    </TableCell>

                    {/* PRODUCTO */}
                    <TableCell sx={{ maxWidth: 340 }}>
                      <TextField
                        size="small"
                        value={p.manualName ?? p.name ?? ""}
                        onChange={(e) =>
                          updateFieldById(p._id, "manualName", e.target.value)
                        }
                        fullWidth
                        InputProps={{
                          sx: {
                            fontSize: 13,
                            fontWeight: 600,
                          },
                        }}
                      />

                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        {p.barcode}
                      </Typography>
                      {p.__missingInImport && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "error.main",
                            fontWeight: 600,
                            mt: 0.3,
                          }}
                        >
                          ⚠ No está en el import (precio/stock pueden ser
                          incorrectos)
                        </Typography>
                      )}
                    </TableCell>

                    {/* PRECIO */}
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={p.manualPrice ?? p.currentPrice ?? ""}
                        onChange={(e) =>
                          updateFieldById(
                            p._id,
                            "manualPrice",
                            Number(e.target.value),
                          )
                        }
                        sx={{ width: 110 }}
                      />
                    </TableCell>

                    {/* PRECIO ANTERIOR */}
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={p.manualPreviousPrice ?? ""}
                        onChange={(e) =>
                          updateFieldById(
                            p._id,
                            "manualPreviousPrice",
                            Number(e.target.value),
                          )
                        }
                        sx={{ width: 110 }}
                      />
                    </TableCell>

                    {/* DESCUENTO */}
                    {/* <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={p.discount ?? 0}
                        onChange={(e) =>
                          updateField(index, "discount", Number(e.target.value))
                        }
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell> */}
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={p.discount ?? 0}
                        onChange={(e) =>
                          updateFieldById(
                            p._id,
                            "discount",
                            Number(e.target.value),
                          )
                        }
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 80 }}
                        inputRef={(el) => (discountRefs.current[index] = el)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            discountRefs.current[index + 1]?.focus();
                            discountRefs.current[index + 1]?.select?.();
                          }
                        }}
                      />
                    </TableCell>
                    {/* FINAL */}
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        ${finalPrice.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* STOCK */}
                    <TableCell align="right">
                      <Typography>
                        {typeof p.stock === "number" ? p.stock : "-"}
                      </Typography>
                    </TableCell>

                    {/* ESTADO */}
                    <TableCell align="center">
                      {hasStock ? (
                        <Chip label="Con stock" size="small" color="success" />
                      ) : (
                        <Chip label="Sin stock" size="small" color="warning" />
                      )}
                    </TableCell>

                    {/* ETIQUETA */}
                    {showTipoEtiqueta && (
                      <TableCell align="center">
                        <Select
                          size="small"
                          value={p.tipoEtiqueta || "oferta"}
                          onChange={(e) =>
                            updateFieldById(
                              p._id,
                              "tipoEtiqueta",
                              e.target.value,
                            )
                          }
                          sx={{ width: 140 }}
                        >
                          <MenuItem value="oferta">Oferta</MenuItem>
                          <MenuItem value="liquidacion">Liquidación</MenuItem>
                          <MenuItem value="nuevo">Nuevo</MenuItem>
                          <MenuItem value="promo">Promo</MenuItem>
                        </Select>
                      </TableCell>
                    )}

                    {/* ACCIONES */}
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => removeProduct(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default EtiquetasTable;
