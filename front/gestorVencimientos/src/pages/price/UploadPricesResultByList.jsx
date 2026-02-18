
// import React, { useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Chip,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Divider,
// } from "@mui/material";
// import { UploadFile, Inventory2 } from "@mui/icons-material";
// import { exportToTXT } from "../../../utils/exportUtils";

// const CATEGORY = {
//   AUMENTO: "Aumentos",
//   BAJA: "Bajas",
//   PRIMERA: "Primera etiqueta",
//   SIN_CAMBIO: "Sin cambios",
//   FALTANTE: "No encontrados en Excel",
// };

// const CATEGORY_ORDER = ["AUMENTO", "BAJA", "PRIMERA", "SIN_CAMBIO", "FALTANTE"];

// const getCategoryChipProps = (categoryKey) => {
//   switch (categoryKey) {
//     case "AUMENTO":
//       return { label: "Aumento", color: "success" };
//     case "BAJA":
//       return { label: "Baja", color: "error" };
//     case "PRIMERA":
//       return { label: "Primera", color: "info" };
//     case "SIN_CAMBIO":
//       return { label: "Sin cambio", color: "default" };
//     case "FALTANTE":
//       return { label: "Faltante", color: "warning" };
//     default:
//       return { label: "Otro", color: "default" };
//   }
// };

// const formatPrice = (value) => {
//   if (value === null || value === undefined || Number.isNaN(value)) return "—";
//   return `$${Number(value).toFixed(2)}`;
// };

// export default function UploadPricesResultByList({ data }) {
//   const defaultCategoryState = {
//     AUMENTO: true,
//     BAJA: true,
//     PRIMERA: true,
//     SIN_CAMBIO: false,
//     FALTANTE: true,
//   };

//   const [selectedCategoriesByList, setSelectedCategoriesByList] = useState({});

//   const [search, setSearch] = useState("");

//   if (!data || !data.lists || data.lists.length === 0) {
//     return <Typography>No hay resultados para mostrar.</Typography>;
//   }

//   const toggleCategory = (listId, key) => {
//     setSelectedCategoriesByList((prev) => {
//       const current = prev[listId] || defaultCategoryState;

//       return {
//         ...prev,
//         [listId]: {
//           ...current,
//           [key]: !current[key],
//         },
//       };
//     });
//   };

//   const buildRows = (list) => {
//     const increased =
//       list.priceIncreased?.map((p) => ({ ...p, category: "AUMENTO" })) || [];
//     const decreased =
//       list.priceDecreased?.map((p) => ({ ...p, category: "BAJA" })) || [];
//     const firstTime =
//       list.firstTimeSet?.map((p) => ({ ...p, category: "PRIMERA" })) || [];
//     const unchanged =
//       list.priceUnchanged?.map((p) => ({ ...p, category: "SIN_CAMBIO" })) || [];
//     const missing =
//       list.missingInImport?.map((p) => ({ ...p, category: "FALTANTE" })) || [];

//     return [...increased, ...decreased, ...firstTime, ...unchanged, ...missing];
//   };

//   const handleExport = (rows, listName) => {
//     const barcodes = rows.map((p) => p.barcode).filter(Boolean);

//     if (barcodes.length === 0) return;

//     exportToTXT(barcodes, `etiquetas_${listName.replace(/\s+/g, "_")}.txt`);
//   };

//   return (
//     <Box mt={3}>
//       <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
//         ✅ {data.message || "Importación aplicada"}
//       </Typography>

//       {data.lists.map((list) => {
//         const allRows = buildRows(list);
//         const selectedCategories =
//           selectedCategoriesByList[list.listId] || defaultCategoryState;

//        const s = search.trim().toLowerCase();

// const filteredRows = allRows
//   .filter((p) => selectedCategories[p.category])
//   .filter((p) => {
//     if (!s) return true;
//     const name = (p.name || "").toLowerCase();
//     const barcode = String(p.barcode || "").toLowerCase();
//     return name.includes(s) || barcode.includes(s);
//   })
//   .sort((a, b) => {
//     const ca = CATEGORY_ORDER.indexOf(a.category);
//     const cb = CATEGORY_ORDER.indexOf(b.category);
//     if (ca !== cb) return ca - cb;
//     return (a.name || "").localeCompare(b.name || "");
//   });

//         const counts = {
//           AUMENTO: list.priceIncreased?.length || 0,
//           BAJA: list.priceDecreased?.length || 0,
//           PRIMERA: list.firstTimeSet?.length || 0,
//           SIN_CAMBIO: list.priceUnchanged?.length || 0,
//           FALTANTE: list.missingInImport?.length || 0,
//         };

//         return (
//           <Paper
//             key={list.listId}
//             variant="outlined"
//             sx={{
//               p: 3,
//               mb: 4,
//               borderRadius: 3,
//               backgroundColor: "#fcfcfc",
//             }}
//           >
//             {/* HEADER */}
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//               flexWrap="wrap"
//               mb={2}
//             >
//               <Box display="flex" alignItems="center" gap={1}>
//                 <Inventory2 color="primary" />
//                 <Typography variant="subtitle1" fontWeight={800}>
//                   Lista: {list.listName}
//                 </Typography>
//               </Box>

//               <Button
//                 size="small"
//                 variant="contained"
//                 startIcon={<UploadFile />}
//                 onClick={() => handleExport(filteredRows, list.listName)}
//                 disabled={filteredRows.length === 0}
//               >
//                 Exportar filtrados ({filteredRows.length})
//               </Button>
//             </Box>

//             {/* FILTERS */}
//             <Box mb={2}>
//               <Typography variant="body2" color="text.secondary" mb={1}>
//                 Filtrar categorías (y exportar sólo lo seleccionado):
//               </Typography>

//               <FormGroup row>
//                 {Object.keys(CATEGORY).map((key) => (
//                   <FormControlLabel
//                     key={key}
//                     control={
//                       <Checkbox
//                         checked={selectedCategories[key]}
//                         onChange={() => toggleCategory(list.listId, key)}

//                       />
//                     }
//                     label={`${CATEGORY[key]} (${counts[key]})`}
//                   />
//                 ))}
//               </FormGroup>
//             </Box>

//             {/* SEARCH */}
//             <Box mb={2}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 label="Buscar por nombre o código de barras"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </Box>

//             <Divider sx={{ mb: 2 }} />

//             {/* TABLE */}
//             <TableContainer component={Paper} variant="outlined">
//               <Table size="small">
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "#f3f3f3" }}>
//                     <TableCell>
//                       <strong>Categoría</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Producto</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Código</strong>
//                     </TableCell>
//                     <TableCell align="right">
//                       <strong>Precio anterior</strong>
//                     </TableCell>
//                     <TableCell align="right">
//                       <strong>Precio nuevo</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Última etiqueta</strong>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {filteredRows.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6}>
//                         <Typography variant="body2" color="text.secondary">
//                           No hay productos para mostrar con los filtros
//                           actuales.
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredRows.map((p, idx) => {
//                       const chipProps = getCategoryChipProps(p.category);

//                       // ✅ ACA EL CAMBIO:
//                       const tagDate = p.lastTagDate || p.previousTagDate;

//                       return (
//                         <TableRow key={`${p.barcode}-${p.category}-${idx}`}>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={chipProps.label}
//                               color={chipProps.color}
//                               variant={
//                                 p.category === "SIN_CAMBIO"
//                                   ? "outlined"
//                                   : "filled"
//                               }
//                             />
//                           </TableCell>

//                           <TableCell>{p.name || "Sin nombre"}</TableCell>

//                           <TableCell>
//                             <Typography
//                               variant="body2"
//                               sx={{ fontFamily: "monospace" }}
//                             >
//                               {p.barcode || "—"}
//                             </Typography>
//                           </TableCell>

//                           <TableCell align="right">
//                             {p.category === "PRIMERA" ||
//                             p.category === "FALTANTE"
//                               ? "—"
//                               : formatPrice(p.oldPrice)}
//                           </TableCell>

//                           <TableCell align="right">
//                             {p.category === "FALTANTE"
//                               ? "—"
//                               : formatPrice(p.newPrice ?? p.price)}
//                           </TableCell>

//                           <TableCell>
//                             {tagDate ? (
//                               new Date(tagDate).toLocaleDateString()
//                             ) : (
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                               >
//                                 Sin etiquetado
//                               </Typography>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Paper>
//         );
//       })}
//     </Box>
//   );
// }

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import { UploadFile, Inventory2, FileDownload } from "@mui/icons-material";
import { exportToTXT } from "../../../utils/exportUtils";
import { timeAgo } from "../../../utils/timeAgo";

const CATEGORY = {
  AUMENTO: "Aumentos",
  BAJA: "Bajas",
  PRIMERA: "Primera etiqueta",
  SIN_CAMBIO: "Sin cambios",
  FALTANTE: "No encontrados en Excel",
};

const CATEGORY_ORDER = ["AUMENTO", "BAJA", "PRIMERA", "SIN_CAMBIO", "FALTANTE"];

const getCategoryChipProps = (categoryKey) => {
  switch (categoryKey) {
    case "AUMENTO":
      return { label: "Aumento", color: "success" };
    case "BAJA":
      return { label: "Baja", color: "error" };
    case "PRIMERA":
      return { label: "Primera", color: "info" };
    case "SIN_CAMBIO":
      return { label: "Sin cambio", color: "default" };
    case "FALTANTE":
      return { label: "Faltante", color: "warning" };
    default:
      return { label: "Otro", color: "default" };
  }
};

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `$${Number(value).toFixed(2)}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return null;
  }
};

export default function UploadPricesResultByList({ data }) {
  // 🔥 estado global SOLO para el buscador (si querés que sea por lista, también se puede)
  const [search, setSearch] = useState("");

  // 🔥 estado por lista: filtros independientes
  // { [listId]: { AUMENTO:true, ... } }
  const [filtersByList, setFiltersByList] = useState({});

  if (!data || !data.lists || data.lists.length === 0) {
    return <Typography>No hay resultados para mostrar.</Typography>;
  }

  const getFiltersForList = (listId) => {
    // default
    const defaultFilters = {
      AUMENTO: true,
      BAJA: true,
      PRIMERA: true,
      SIN_CAMBIO: false,
      FALTANTE: false,
    };

    return filtersByList[listId] || defaultFilters;
  };

  const toggleCategory = (listId, key) => {
    setFiltersByList((prev) => {
      const current = prev[listId] || {
        AUMENTO: true,
        BAJA: true,
        PRIMERA: true,
        SIN_CAMBIO: false,
        FALTANTE: true,
      };

      return {
        ...prev,
        [listId]: {
          ...current,
          [key]: !current[key],
        },
      };
    });
  };

  const buildRows = (list) => {
    const increased =
      list.priceIncreased?.map((p) => ({ ...p, category: "AUMENTO" })) || [];
    const decreased =
      list.priceDecreased?.map((p) => ({ ...p, category: "BAJA" })) || [];
    const firstTime =
      list.firstTimeSet?.map((p) => ({ ...p, category: "PRIMERA" })) || [];
    const unchanged =
      list.priceUnchanged?.map((p) => ({ ...p, category: "SIN_CAMBIO" })) || [];
    const missing =
      list.missingInImport?.map((p) => ({ ...p, category: "FALTANTE" })) || [];

    return [...increased, ...decreased, ...firstTime, ...unchanged, ...missing];
  };

  const getFilteredRowsForList = (list) => {
    const allRows = buildRows(list);
    const selectedCategories = getFiltersForList(list.listId);

    const s = search.trim().toLowerCase();

    return allRows
      .filter((p) => selectedCategories[p.category])
      .filter((p) => {
        if (!s) return true;
        const name = (p.name || "").toLowerCase();
        const barcode = String(p.barcode || "").toLowerCase();
        const scanned = String(p.scannedBarcode || "").toLowerCase();
        return (
          name.includes(s) || barcode.includes(s) || scanned.includes(s)
        );
      })
      .sort((a, b) => {
        const ca = CATEGORY_ORDER.indexOf(a.category);
        const cb = CATEGORY_ORDER.indexOf(b.category);
        if (ca !== cb) return ca - cb;
        return (a.name || "").localeCompare(b.name || "");
      });
  };

  const handleExport = (rows, fileName) => {
    const barcodes = rows.map((p) => p.barcode).filter(Boolean);

    if (barcodes.length === 0) return;

    exportToTXT(barcodes, fileName);
  };

  // ✅ BOTÓN MAESTRO: exporta lo filtrado de TODAS las listas
  const masterExportRows = useMemo(() => {
    const all = [];

    for (const list of data.lists) {
      const rows = getFilteredRowsForList(list);

      // opcional: para saber de qué lista era cada producto
      rows.forEach((r) => {
        all.push({
          ...r,
          listName: list.listName,
        });
      });
    }

    // dedupe por barcode (para no exportar repetidos)
    const seen = new Set();
    const unique = [];

    for (const r of all) {
      const bc = String(r.barcode || "").trim();
      if (!bc) continue;
      if (seen.has(bc)) continue;
      seen.add(bc);
      unique.push(r);
    }

    return unique;
  }, [data.lists, filtersByList, search]);

  const totalFilteredCount = masterExportRows.length;

  return (
    <Box mt={3}>
      {/* HEADER GLOBAL */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(180deg, #ffffff, #fafafa)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900} color="primary">
              ✅ {data.message || "Importación aplicada"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Podés filtrar por categoría y exportar sólo lo que querés etiquetar.
            </Typography>
          </Box>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Tooltip title="Exporta todos los productos filtrados de todas las listas (sin duplicados)">
              <span>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  disabled={totalFilteredCount === 0}
                  onClick={() =>
                    handleExport(
                      masterExportRows,
                      `etiquetas_TODAS_LAS_LISTAS.txt`
                    )
                  }
                >
                  Exportar TODO ({totalFilteredCount})
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* SEARCH GLOBAL */}
        <Box mt={2}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por nombre o código (principal o escaneado)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      </Paper>

      {/* LISTAS */}
      {data.lists.map((list) => {
        const selectedCategories = getFiltersForList(list.listId);

        const allRows = buildRows(list);
        const filteredRows = getFilteredRowsForList(list);

        const counts = {
          AUMENTO: list.priceIncreased?.length || 0,
          BAJA: list.priceDecreased?.length || 0,
          PRIMERA: list.firstTimeSet?.length || 0,
          SIN_CAMBIO: list.priceUnchanged?.length || 0,
          FALTANTE: list.missingInImport?.length || 0,
        };

        return (
          <Paper
            key={list.listId}
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
            }}
          >
            {/* HEADER LISTA */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
              mb={2}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Inventory2 color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={900}>
                    Lista: {list.listName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total items: {allRows.length} | Mostrando:{" "}
                    {filteredRows.length}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                variant="contained"
                startIcon={<UploadFile />}
                onClick={() =>
                  handleExport(
                    filteredRows,
                    `etiquetas_${list.listName.replace(/\s+/g, "_")}.txt`
                  )
                }
                disabled={filteredRows.length === 0}
              >
                Exportar filtrados ({filteredRows.length})
              </Button>
            </Stack>

            {/* FILTERS */}
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Filtrar categorías:
              </Typography>

              <FormGroup row>
                {Object.keys(CATEGORY).map((key) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={!!selectedCategories[key]}
                        onChange={() => toggleCategory(list.listId, key)}
                      />
                    }
                    label={`${CATEGORY[key]} (${counts[key]})`}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* TABLE */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      <strong>Categoría</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Producto</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Código</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Precio anterior</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Precio nuevo</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Etiqueta</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">
                          No hay productos para mostrar con los filtros actuales.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((p, idx) => {
                      const chipProps = getCategoryChipProps(p.category);

                      // ✅ mostramos taggedAt si taggedNow
                      const dateToShow = p.taggedNow
                        ? p.taggedAt
                        : p.previousTagDate;

                      const dateText = formatDate(dateToShow);

                      return (
                        <TableRow key={`${p._id}-${p.category}-${idx}`}>
                          <TableCell>
                            <Chip
                              size="small"
                              label={chipProps.label}
                              color={chipProps.color}
                              variant={
                                p.category === "SIN_CAMBIO"
                                  ? "outlined"
                                  : "filled"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {p.name || "Sin nombre"}
                            </Typography>

                            {p.scannedBarcode &&
                            p.scannedBarcode !== p.barcode ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Escaneado:{" "}
                                <span style={{ fontFamily: "monospace" }}>
                                  {p.scannedBarcode}
                                </span>
                              </Typography>
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {p.barcode || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {p.category === "PRIMERA" ||
                            p.category === "FALTANTE"
                              ? "—"
                              : formatPrice(p.oldPrice)}
                          </TableCell>

                          <TableCell align="right">
                            {p.category === "FALTANTE"
                              ? "—"
                              : formatPrice(p.newPrice ?? p.price)}
                          </TableCell>

                          {/* <TableCell>
                            {p.taggedNow ? (
                              <Chip
                                size="small"
                                label="Etiquetado hoy"
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            ) : null}

                            {dateText ? (
                              <Typography variant="body2">{dateText}</Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sin etiquetado
                              </Typography>
                            )}
                          </TableCell> */}

                          <TableCell>
  {/* 1) estado de etiquetado */}
  {p.taggedNow ? (
    <Chip
      size="small"
      label="Etiquetado hoy"
      color="primary"
      variant="outlined"
      sx={{ mr: 1, mb: 0.5 }}
    />
  ) : null}

  {/* 2) fuente del precio */}
  {p.sourceImportDate ? (
    <Tooltip
      title={
        <>
          <Typography variant="caption" display="block">
            Sucursal: <b>{p.sourceBranchName || "—"}</b>
          </Typography>
          <Typography variant="caption" display="block">
            Import: <b>{p.sourceImportId || "—"}</b>
          </Typography>
          <Typography variant="caption" display="block">
            Fecha: <b>{new Date(p.sourceImportDate).toLocaleString()}</b>
          </Typography>
        </>
      }
    >
      <Chip
        size="small"
        label={
          p.priceSource === "fallback"
            ? `${p.sourceBranchName} • ${timeAgo(p.sourceImportDate)}`
            : `Import propio • ${timeAgo(p.sourceImportDate)}`
        }
        color={p.priceSource === "fallback" ? "warning" : "success"}
        variant="outlined"
        sx={{ mb: 0.5 }}
      />
    </Tooltip>
  ) : (
    <Chip
      size="small"
      label="Sin info de import"
      color="default"
      variant="outlined"
      sx={{ mb: 0.5 }}
    />
  )}

  {/* 3) fecha última etiqueta */}
  {dateText ? (
    <Typography variant="body2">{dateText}</Typography>
  ) : (
    <Typography variant="caption" color="text.secondary">
      Sin etiquetado
    </Typography>
  )}
</TableCell>

                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}
    </Box>
  );
}

