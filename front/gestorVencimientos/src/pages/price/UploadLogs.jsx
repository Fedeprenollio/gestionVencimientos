
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";

// import {
//   Box,
//   Typography,
//   Button,
//   Pagination,
//   CircularProgress,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   TextField,
//   Drawer,
//   Divider,
//   Tabs,
//   Tab,
//   IconButton,
//   Tooltip,
// } from "@mui/material";

// import CloseIcon from "@mui/icons-material/Close";
// import HistoryIcon from "@mui/icons-material/History";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { TrendingUp, TrendingDown, NewReleases, RemoveCircleOutline } from "@mui/icons-material";
// import { UploadFile } from "@mui/icons-material";

// import { fetchUploadLogs, fetchUploadLogsByBranch } from "../../api/productApi";
// import { exportToTXT } from "../../../utils/exportUtils";

// const TAB_KEYS = ["priceIncreased", "priceDecreased", "priceUnchanged", "firstTimeSet"];

// const groupLabels = {
//   priceIncreased: {
//     label: "Aumentos",
//     color: "success",
//     icon: <TrendingUp fontSize="small" />,
//   },
//   priceDecreased: {
//     label: "Bajas",
//     color: "error",
//     icon: <TrendingDown fontSize="small" />,
//   },
//   priceUnchanged: {
//     label: "Sin cambios",
//     color: "default",
//     icon: <RemoveCircleOutline fontSize="small" />,
//   },
//   firstTimeSet: {
//     label: "Primera etiqueta",
//     color: "info",
//     icon: <NewReleases fontSize="small" />,
//   },
// };

// const formatMoney = (value) => {
//   if (value === null || value === undefined || Number.isNaN(value)) return "—";
//   return `$${Number(value).toFixed(2)}`;
// };

// const formatDate = (value) => {
//   if (!value) return "—";
//   try {
//     return new Date(value).toLocaleString("es-AR");
//   } catch {
//     return "—";
//   }
// };

// const exportCodes = (products, filename) => {
//   const codes = (products || [])
//     .map((p) => p.barcode)
//     .filter(Boolean);

//   if (codes.length === 0) return;

//   exportToTXT(codes, filename);
// };

// export default function UploadLogs() {
//   const { listId } = useParams();
//   const location = useLocation();
//   const branchId = new URLSearchParams(location.search).get("branch");

//   const [logs, setLogs] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);

//   // búsqueda
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   // drawer
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [selectedLog, setSelectedLog] = useState(null);
//   const [tabKey, setTabKey] = useState("priceIncreased");

//   // debounce
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//       setPage(1);
//     }, 500);

//     return () => clearTimeout(handler);
//   }, [searchTerm]);

//   const loadLogs = async () => {
//     try {
//       setLoading(true);
//       let res;

//       // ojo: acá pasamos debouncedSearch, no searchTerm
//       if (listId) {
//         res = await fetchUploadLogs(listId, page, debouncedSearch);
//       } else if (branchId) {
//         res = await fetchUploadLogsByBranch(branchId, page, debouncedSearch);
//       } else {
//         res = { logs: [], total: 0 };
//       }

//       setLogs(res.logs || []);
//       setTotalPages(Math.ceil((res.total || 0) / 10));
//     } catch (err) {
//       console.error("Error cargando logs", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // llamamos a la API sólo si no hay búsqueda o si tiene al menos 3 letras
//     if ((debouncedSearch && debouncedSearch.length >= 3) || debouncedSearch === "") {
//       if (listId || branchId) loadLogs();
//     }
//   }, [listId, branchId, page, debouncedSearch]);

//   const openDrawer = (log) => {
//     setSelectedLog(log);
//     setTabKey("priceIncreased"); // default
//     setDrawerOpen(true);
//   };

//   const closeDrawer = () => {
//     setDrawerOpen(false);
//     setSelectedLog(null);
//   };

//   const selectedProducts = useMemo(() => {
//     if (!selectedLog) return [];
//     return selectedLog[tabKey] || [];
//   }, [selectedLog, tabKey]);

//   const exportAllFromLog = (log) => {
//     if (!log) return;

//     const all = [
//       ...(log.priceIncreased || []),
//       ...(log.priceDecreased || []),
//       ...(log.firstTimeSet || []),
//       ...(log.priceUnchanged || []),
//     ];

//     const timestamp = new Date(log.createdAt).toLocaleString("es-AR");
//     const suffix = timestamp.replace(/[\s:/]/g, "_");

//     exportCodes(all, `TODO_${log.listName}_${suffix}.txt`);
//   };

//   return (
//     <Box p={2}>
//       {/* HEADER */}
//       <Box display="flex" alignItems="center" gap={1} mb={2}>
//         <HistoryIcon color="primary" fontSize="large" />
//         <Box>
//           <Typography variant="h5" color="primary" fontWeight={800}>
//             Historial de cargas de precios
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Buscá una lista, mirá el resumen por día y abrí el detalle en el panel lateral.
//           </Typography>
//         </Box>
//       </Box>

//       {/* SEARCH */}
//       <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
//         <TextField
//           label="Buscar por lista (mínimo 3 letras)"
//           variant="outlined"
//           size="small"
//           fullWidth
//           value={searchTerm}
//           onChange={(e) => {
//             setPage(1);
//             setSearchTerm(e.target.value);
//           }}
//         />
//       </Paper>

//       {/* LOADING */}
//       {loading && (
//         <Box display="flex" justifyContent="center" my={4}>
//           <CircularProgress />
//         </Box>
//       )}

//       {/* EMPTY */}
//       {!loading && logs.length === 0 ? (
//         <Typography>No hay registros que coincidan.</Typography>
//       ) : null}

//       {/* TABLE OF LOGS */}
//       {!loading && logs.length > 0 && (
//         <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
//           <TableContainer>
//             <Table size="small">
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: "#f6f6f6" }}>
//                   <TableCell>
//                     <strong>Fecha</strong>
//                   </TableCell>
//                   <TableCell>
//                     <strong>Lista</strong>
//                   </TableCell>
//                   <TableCell align="center">
//                     <strong>Aumentos</strong>
//                   </TableCell>
//                   <TableCell align="center">
//                     <strong>Bajas</strong>
//                   </TableCell>
//                   <TableCell align="center">
//                     <strong>Sin cambios</strong>
//                   </TableCell>
//                   <TableCell align="center">
//                     <strong>Primera</strong>
//                   </TableCell>
//                   <TableCell align="right">
//                     <strong>Acciones</strong>
//                   </TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {logs.map((log) => {
//                   const timestamp = new Date(log.createdAt).toLocaleString("es-AR");
//                   const suffix = timestamp.replace(/[\s:/]/g, "_");

//                   return (
//                     <TableRow key={log._id} hover>
//                       <TableCell sx={{ whiteSpace: "nowrap" }}>
//                         <Box display="flex" alignItems="center" gap={1}>
//                           <AccessTimeIcon fontSize="small" color="action" />
//                           <Typography variant="body2">{timestamp}</Typography>
//                         </Box>
//                       </TableCell>

//                       <TableCell>
//                         <Typography fontWeight={700}>{log.listName}</Typography>
//                       </TableCell>

//                       <TableCell align="center">
//                         <Chip
//                           label={log.priceIncreased?.length || 0}
//                           color="success"
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>

//                       <TableCell align="center">
//                         <Chip
//                           label={log.priceDecreased?.length || 0}
//                           color="error"
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>

//                       <TableCell align="center">
//                         <Chip
//                           label={log.priceUnchanged?.length || 0}
//                           color="default"
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>

//                       <TableCell align="center">
//                         <Chip
//                           label={log.firstTimeSet?.length || 0}
//                           color="info"
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>

//                       <TableCell align="right">
//                         <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
//                           <Button
//                             size="small"
//                             variant="contained"
//                             onClick={() => openDrawer(log)}
//                           >
//                             Ver detalle
//                           </Button>

//                           <Tooltip title="Exportar TODO (todas las categorías)">
//                             <Button
//                               size="small"
//                               variant="outlined"
//                               startIcon={<UploadFile />}
//                               onClick={() =>
//                                 exportAllFromLog(log, `TODO_${log.listName}_${suffix}.txt`)
//                               }
//                             >
//                               Exportar todo
//                             </Button>
//                           </Tooltip>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           {/* PAGINATION */}
//           <Box display="flex" justifyContent="center" py={2}>
//             <Pagination
//               count={totalPages}
//               page={page}
//               onChange={(e, value) => setPage(value)}
//             />
//           </Box>
//         </Paper>
//       )}

//       {/* DRAWER */}
//       <Drawer
//         anchor="right"
//         open={drawerOpen}
//         onClose={closeDrawer}
//         PaperProps={{
//           sx: {
//             width: { xs: "100%", sm: 720 },
//             p: 2,
//           },
//         }}
//       >
//         {!selectedLog ? (
//           <Typography>Cargando...</Typography>
//         ) : (
//           <>
//             {/* Drawer header */}
//             <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
//               <Box>
//                 <Typography variant="h6" fontWeight={900}>
//                   {selectedLog.listName}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {formatDate(selectedLog.createdAt)}
//                 </Typography>
//               </Box>

//               <IconButton onClick={closeDrawer}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             {/* Tabs */}
//             <Tabs
//               value={tabKey}
//               onChange={(e, val) => setTabKey(val)}
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               {TAB_KEYS.map((key) => (
//                 <Tab
//                   key={key}
//                   value={key}
//                   label={`${groupLabels[key].label} (${selectedLog[key]?.length || 0})`}
//                 />
//               ))}
//             </Tabs>

//             <Divider sx={{ my: 2 }} />

//             {/* Drawer actions */}
//             <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
//               <Button
//                 variant="contained"
//                 startIcon={<UploadFile />}
//                 disabled={(selectedLog[tabKey] || []).length === 0}
//                 onClick={() => {
//                   const timestamp = new Date(selectedLog.createdAt).toLocaleString("es-AR");
//                   const suffix = timestamp.replace(/[\s:/]/g, "_");
//                   exportCodes(
//                     selectedLog[tabKey],
//                     `${tabKey}_${selectedLog.listName}_${suffix}.txt`
//                   );
//                 }}
//               >
//                 Exportar {groupLabels[tabKey].label}
//               </Button>

//               <Button
//                 variant="outlined"
//                 startIcon={<UploadFile />}
//                 onClick={() => exportAllFromLog(selectedLog)}
//               >
//                 Exportar TODO
//               </Button>
//             </Box>

//             {/* Products table */}
//             <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
//               <TableContainer>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow sx={{ backgroundColor: "#f6f6f6" }}>
//                       <TableCell>
//                         <strong>Producto</strong>
//                       </TableCell>
//                       <TableCell>
//                         <strong>Código</strong>
//                       </TableCell>

//                       {tabKey !== "firstTimeSet" && (
//                         <TableCell align="right">
//                           <strong>Precio anterior</strong>
//                         </TableCell>
//                       )}

//                       <TableCell align="right">
//                         <strong>{tabKey === "firstTimeSet" ? "Precio" : "Precio nuevo"}</strong>
//                       </TableCell>

//                       <TableCell>
//                         <strong>Última etiqueta</strong>
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {selectedProducts.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={5}>
//                           <Typography variant="body2" color="text.secondary">
//                             No hay productos en esta categoría.
//                           </Typography>
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       selectedProducts.map((p, idx) => (
//                         <TableRow key={`${p.barcode}-${idx}`} hover>
//                           <TableCell>{p.name || "—"}</TableCell>

//                           <TableCell sx={{ fontFamily: "monospace" }}>
//                             {p.barcode || "—"}
//                           </TableCell>

//                           {tabKey !== "firstTimeSet" && (
//                             <TableCell align="right">
//                               {formatMoney(p.oldPrice)}
//                             </TableCell>
//                           )}

//                           <TableCell align="right">
//                             {formatMoney(p.newPrice ?? p.price)}
//                           </TableCell>

//                           <TableCell>
//                             {p.previousTagDate ? (
//                               <Typography variant="body2">
//                                 {new Date(p.previousTagDate).toLocaleDateString("es-AR")}
//                               </Typography>
//                             ) : (
//                               <Typography variant="caption" color="text.secondary">
//                                 Sin etiquetado
//                               </Typography>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </Paper>

//             <Box mt={2}>
//               <Typography variant="caption" color="text.secondary">
//                 Tip: “Sin cambios” suele ser enorme. Si te molesta, lo podemos ocultar por
//                 defecto o paginarlo.
//               </Typography>
//             </Box>
//           </>
//         )}
//       </Drawer>
//     </Box>
//   );
// }
// src/components/price/UploadLogs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Pagination,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Drawer,
  Divider,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { TrendingUp, TrendingDown, NewReleases } from "@mui/icons-material";

import { fetchUploadLogs, fetchUploadLogsByBranch } from "../../api/productApi";
import { exportToTXT } from "../../../utils/exportUtils";

const PER_PAGE_LOGS = 10;
const PER_PAGE_PRODUCTS = 20;

const formatDateTimeAR = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR");
};

const formatPrice = (v) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `$${Number(v).toFixed(2)}`;
};

const CATEGORY = {
  AUMENTO: "Aumentos",
  BAJA: "Bajas",
  PRIMERA: "Primera etiqueta",
  SIN_CAMBIO: "Sin cambios",
};

const CATEGORY_ORDER = ["AUMENTO", "BAJA", "PRIMERA", "SIN_CAMBIO"];

const getCategoryChipProps = (categoryKey) => {
  switch (categoryKey) {
    case "AUMENTO":
      return { label: "Aumento", color: "success", icon: <TrendingUp fontSize="small" /> };
    case "BAJA":
      return { label: "Baja", color: "error", icon: <TrendingDown fontSize="small" /> };
    case "PRIMERA":
      return { label: "Primera", color: "info", icon: <NewReleases fontSize="small" /> };
    case "SIN_CAMBIO":
      return { label: "Sin cambio", color: "default", icon: null };
    default:
      return { label: "Otro", color: "default", icon: null };
  }
};

export default function UploadLogs() {
  const { listId } = useParams();
  const location = useLocation();
  const branchId = new URLSearchParams(location.search).get("branch");

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // búsqueda por lista
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLog, setActiveLog] = useState(null);

  // paginación dentro del drawer
  const [drawerPage, setDrawerPage] = useState(1);

  // selección de categorías para exportar (global y drawer)
  const [selectedCategories, setSelectedCategories] = useState({
    AUMENTO: true,
    BAJA: true,
    PRIMERA: true,
    SIN_CAMBIO: false,
  });

  // debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let res;

      if (listId) {
        res = await fetchUploadLogs(listId, page, debouncedSearch);
      } else if (branchId) {
        res = await fetchUploadLogsByBranch(branchId, page, debouncedSearch);
      } else {
        res = { logs: [], total: 0 };
      }

      setLogs(res.logs || []);
      setTotalPages(Math.ceil((res.total || 0) / PER_PAGE_LOGS));
    } catch (err) {
      console.error("Error cargando logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // si no hay búsqueda o tiene al menos 3 letras
    if (debouncedSearch === "" || debouncedSearch.length >= 3) {
      loadLogs();
    }
  }, [listId, branchId, page, debouncedSearch]);

  /**
   * Construir rows por log (para export y para drawer)
   */
  const buildRowsFromLog = (log) => {
    if (!log) return [];

    const increased =
      log.priceIncreased?.map((p) => ({ ...p, category: "AUMENTO" })) || [];
    const decreased =
      log.priceDecreased?.map((p) => ({ ...p, category: "BAJA" })) || [];
    const first =
      log.firstTimeSet?.map((p) => ({ ...p, category: "PRIMERA" })) || [];
    const unchanged =
      log.priceUnchanged?.map((p) => ({ ...p, category: "SIN_CAMBIO" })) || [];

    return [...increased, ...decreased, ...first, ...unchanged];
  };

  /**
   * Filtrar rows según checkboxes
   */
  const filterRowsBySelectedCategories = (rows) => {
    return rows.filter((r) => selectedCategories[r.category]);
  };

  /**
   * Export TXT helper
   */
  const exportRowsToTXT = (rows, filename) => {
    const barcodes = rows
      .map((r) => r.barcode)
      .filter(Boolean);

    if (barcodes.length === 0) return;

    exportToTXT(barcodes, filename);
  };

  /**
   * Export MAESTRO: junta todos los logs visibles (página actual)
   */
  const handleExportMaster = () => {
    const allRows = logs.flatMap((log) => buildRowsFromLog(log));
    const filtered = filterRowsBySelectedCategories(allRows);

    const suffix = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_");

    exportRowsToTXT(filtered, `export_maestro_${suffix}.txt`);
  };

  /**
   * Drawer: rows del log activo
   */
  const drawerRows = useMemo(() => {
    const all = buildRowsFromLog(activeLog);

    const filtered = filterRowsBySelectedCategories(all);

    return filtered.sort((a, b) => {
      const ca = CATEGORY_ORDER.indexOf(a.category);
      const cb = CATEGORY_ORDER.indexOf(b.category);
      if (ca !== cb) return ca - cb;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [activeLog, selectedCategories]);

  const drawerTotalPages = Math.ceil(drawerRows.length / PER_PAGE_PRODUCTS);

  const drawerPaginatedRows = useMemo(() => {
    const start = (drawerPage - 1) * PER_PAGE_PRODUCTS;
    return drawerRows.slice(start, start + PER_PAGE_PRODUCTS);
  }, [drawerRows, drawerPage]);

  const openDrawer = (log) => {
    setActiveLog(log);
    setDrawerPage(1);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveLog(null);
  };

  const toggleCategory = (key) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Counts por log (para chips)
   */
  const getCounts = (log) => ({
    AUMENTO: log.priceIncreased?.length || 0,
    BAJA: log.priceDecreased?.length || 0,
    PRIMERA: log.firstTimeSet?.length || 0,
    SIN_CAMBIO: log.priceUnchanged?.length || 0,
  });

  return (
    <Box p={2}>
      {/* HEADER */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HistoryIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5" color="primary" fontWeight={800}>
              Historial de cargas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revisá qué cambió por lista y exportá sólo lo que querés imprimir.
            </Typography>
          </Box>
        </Box>

        {/* <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={handleExportMaster}
          disabled={logs.length === 0}
          sx={{ borderRadius: 3 }}
        >
          Exportar seleccionados (maestro)
        </Button> */}
      </Box>

      {/* CONTROLES */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          backgroundColor: "#fcfcfc",
        }}
      >
        {/* SEARCH */}
        <Box mb={2}>
          <TextField
            label="Buscar por lista (mínimo 3 letras)"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* CATEGORY CHECKBOXES */}
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Categorías a exportar (se aplica al botón maestro y al drawer):
          </Typography>

          <FormGroup row>
            {Object.keys(CATEGORY).map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={selectedCategories[key]}
                    onChange={() => toggleCategory(key)}
                  />
                }
                label={CATEGORY[key]}
              />
            ))}
          </FormGroup>
        </Box>
      </Paper>

      {/* LOADING */}
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {/* EMPTY */}
      {!loading && logs.length === 0 ? (
        <Typography>No hay registros que coincidan.</Typography>
      ) : null}

      {/* TABLE LOGS */}
      {!loading && logs.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <strong>Fecha</strong>
                </TableCell>
                <TableCell>
                  <strong>Lista</strong>
                </TableCell>
                <TableCell>
                  <strong>Resumen</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {logs.map((log) => {
                const counts = getCounts(log);
                const timestamp = formatDateTimeAR(log.createdAt);

                const hasChanges =
                  (counts.AUMENTO || 0) + (counts.BAJA || 0) + (counts.PRIMERA || 0) > 0;

                return (
                  <TableRow key={log._id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">{timestamp}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Inventory2Icon fontSize="small" color="primary" />
                        <Typography fontWeight={700}>
                          {log.listName || "Sin nombre"}
                        </Typography>
                      </Box>

                      {!hasChanges && (
                        <Typography variant="caption" color="text.secondary">
                          (sin cambios relevantes)
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          size="small"
                          color="success"
                          label={`Aumentos: ${counts.AUMENTO}`}
                        />
                        <Chip
                          size="small"
                          color="error"
                          label={`Bajas: ${counts.BAJA}`}
                        />
                        <Chip
                          size="small"
                          color="info"
                          label={`Primeras: ${counts.PRIMERA}`}
                        />
                        <Chip
                          size="small"
                          color="default"
                          label={`Sin cambios: ${counts.SIN_CAMBIO}`}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
                        <Tooltip title="Ver detalle">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openDrawer(log)}
                            sx={{ borderRadius: 3 }}
                          >
                            Ver
                          </Button>
                        </Tooltip>

                        <Tooltip title="Exporta según los checkboxes elegidos arriba">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<UploadFileIcon />}
                            onClick={() => {
                              const rows = filterRowsBySelectedCategories(buildRowsFromLog(log));
                              const suffix = new Date(log.createdAt)
                                .toISOString()
                                .slice(0, 19)
                                .replace(/[:T]/g, "_");
                              exportRowsToTXT(rows, `export_${log.listName}_${suffix}.txt`);
                            }}
                            sx={{ borderRadius: 3 }}
                          >
                            Exportar
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {/* PAGINATION */}
      {!loading && totalPages > 1 ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      ) : null}

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <Box
          sx={{
            width: { xs: 360, sm: 520, md: 720 },
            p: 2,
          }}
        >
          {/* Drawer header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Detalle del log
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeLog?.listName || "—"} • {formatDateTimeAR(activeLog?.createdAt)}
              </Typography>
            </Box>

            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Drawer controls */}
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Exportar categorías:
            </Typography>

            <FormGroup row>
              {Object.keys(CATEGORY).map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={selectedCategories[key]}
                      onChange={() => toggleCategory(key)}
                    />
                  }
                  label={CATEGORY[key]}
                />
              ))}
            </FormGroup>

            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => {
                  if (!activeLog) return;
                  const rows = filterRowsBySelectedCategories(buildRowsFromLog(activeLog));

                  const suffix = new Date(activeLog.createdAt)
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[:T]/g, "_");

                  exportRowsToTXT(rows, `export_${activeLog.listName}_${suffix}.txt`);
                }}
                sx={{ borderRadius: 3 }}
              >
                Exportar seleccionados ({drawerRows.length})
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  // quick preset: cambios reales
                  setSelectedCategories({
                    AUMENTO: true,
                    BAJA: true,
                    PRIMERA: true,
                    SIN_CAMBIO: false,
                  });
                }}
                sx={{ borderRadius: 3 }}
              >
                Sólo cambios
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  // quick preset: todo
                  setSelectedCategories({
                    AUMENTO: true,
                    BAJA: true,
                    PRIMERA: true,
                    SIN_CAMBIO: true,
                  });
                }}
                sx={{ borderRadius: 3 }}
              >
                Todo
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Drawer table */}
          {drawerRows.length === 0 ? (
            <Typography color="text.secondary">
              No hay productos para mostrar con las categorías seleccionadas.
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
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
                        <strong>Antes</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Ahora</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Etiqueta anterior</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {drawerPaginatedRows.map((p, idx) => {
                      const chipProps = getCategoryChipProps(p.category);

                      return (
                        <TableRow key={`${p.barcode}-${p.category}-${idx}`} hover>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Chip
                              size="small"
                              label={chipProps.label}
                              color={chipProps.color}
                              icon={chipProps.icon || undefined}
                              variant={p.category === "SIN_CAMBIO" ? "outlined" : "filled"}
                            />
                          </TableCell>

                          <TableCell>{p.name || "Sin nombre"}</TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                              {p.barcode || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {p.category === "PRIMERA" ? "—" : formatPrice(p.oldPrice)}
                          </TableCell>

                          <TableCell align="right">
                            {formatPrice(p.newPrice ?? p.price)}
                          </TableCell>

                          <TableCell>
                            {p.previousTagDate ? (
                              new Date(p.previousTagDate).toLocaleDateString("es-AR")
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin etiqueta previa
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {drawerTotalPages > 1 ? (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={drawerTotalPages}
                    page={drawerPage}
                    size="small"
                    onChange={(e, val) => setDrawerPage(val)}
                  />
                </Box>
              ) : null}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
