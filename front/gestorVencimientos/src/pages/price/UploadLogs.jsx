// src/components/price/UploadLogs.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TrendingUp, TrendingDown, NewReleases } from "@mui/icons-material";
import { fetchUploadLogs, fetchUploadLogsByBranch } from "../../api/productApi";
import { exportToTXT } from "../../../utils/exportUtils";
import HistoryIcon from "@mui/icons-material/History";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function UploadLogs() {
  const { listId } = useParams();
  const location = useLocation();
const branchId = new URLSearchParams(location.search).get("branch");
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageMap, setPageMap] = useState({}); // local pagination for each log/group

  const groupLabels = {
    priceIncreased: {
      label: "Aumentos",
      color: "success",
      icon: <TrendingUp fontSize="small" />,
    },
    priceDecreased: {
      label: "Bajas",
      color: "error",
      icon: <TrendingDown fontSize="small" />,
    },
    firstTimeSet: {
      label: "Primeros precios",
      color: "info",
      icon: <NewReleases fontSize="small" />,
    },
  };

  // const loadLogs = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetchUploadLogs(listId, page);
  //     setLogs(res.logs || []);
  //     setTotalPages(Math.ceil(res.total / 10));
  //   } catch (err) {
  //     console.error("Error cargando logs", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadLogs = async () => {
  try {
    setLoading(true);
    let res;

    if (listId) {
      res = await fetchUploadLogs(listId, page);
    } else if (branchId) {
      res = await fetchUploadLogsByBranch(branchId, page);
    }

    setLogs(res.logs || []);
    setTotalPages(Math.ceil((res.total || 0) / 10));
  } catch (err) {
    console.error("Error cargando logs", err);
  } finally {
    setLoading(false);
  }
};

console.log("LOGS", logs)

 useEffect(() => {
  if (listId || branchId) loadLogs();
}, [listId, branchId, page]);


  const exportCodes = (products, filename) => {
    const codes = products.map((p) => p.barcode);
    exportToTXT(codes, filename);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <HistoryIcon color="primary" fontSize="large" />
        <Typography variant="h5" color="primary" fontWeight={600}>
          Historial de cargas de precios
        </Typography>
      </Box>
      {logs.length === 0 ? (
        <Typography>No hay registros aún.</Typography>
      ) : (
        <>
          {logs.map((log) => {
            const timestamp = new Date(log.createdAt).toLocaleString("es-AR");
            const suffix = timestamp.replace(/[\s:/]/g, "_");

            return (
              <Accordion key={log._id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      fontWeight={500}
                    >
                      {timestamp}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="textPrimary"
                      fontWeight={600}
                      ml={1}
                    >
                      {log.listName}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    <Chip
                      label={`Aumentos: ${log.priceIncreased.length}`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`Bajas: ${log.priceDecreased.length}`}
                      color="error"
                      size="small"
                    />
                    <Chip
                      label={`Sin cambios: ${log.priceUnchanged.length}`}
                      color="default"
                      size="small"
                    />
                    <Chip
                      label={`Primeros precios: ${log.firstTimeSet.length}`}
                      color="info"
                      size="small"
                    />
                  </Box>

                  {Object.keys(groupLabels).map((key) => {
                    const { label, color, icon } = groupLabels[key];
                    const products = log[key];
                    if (!products || products.length === 0) return null;

                    const logKey = `${log._id}-${key}`;
                    const currentPage = pageMap[logKey] || 1;
                    const perPage = 15;
                    const total = products.length;
                    const paginated = products.slice(
                      (currentPage - 1) * perPage,
                      currentPage * perPage
                    );

                    return (
                      <Box key={key} my={3}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {icon}
                          <Typography variant="h6" color={`${color}.main`}>
                            {label}
                          </Typography>
                          <Chip
                            label={`${products.length} producto${
                              products.length !== 1 ? "s" : ""
                            }`}
                            color={color}
                            size="small"
                          />
                        </Box>

                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell>
                                  <strong>Producto</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Código</strong>
                                </TableCell>
                                {key !== "firstTimeSet" && (
                                  <TableCell align="right">
                                    <strong>Precio anterior</strong>
                                  </TableCell>
                                )}
                                <TableCell align="right">
                                  <strong>
                                    {key === "firstTimeSet"
                                      ? "Precio"
                                      : "Precio nuevo"}
                                  </strong>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paginated.map((p) => (
                                <TableRow key={p.barcode}>
                                  <TableCell>{p.name}</TableCell>
                                  <TableCell>{p.barcode}</TableCell>
                                  {key !== "firstTimeSet" && (
                                    <TableCell align="right">
                                      ${p.oldPrice}
                                    </TableCell>
                                  )}
                                  <TableCell align="right">
                                    ${p.newPrice || p.price}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {total > perPage && (
                          <Box display="flex" justifyContent="center" mb={2}>
                            <Pagination
                              count={Math.ceil(total / perPage)}
                              page={currentPage}
                              size="small"
                              onChange={(e, val) =>
                                setPageMap((prev) => ({
                                  ...prev,
                                  [logKey]: val,
                                }))
                              }
                            />
                          </Box>
                        )}

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            exportCodes(
                              products,
                              `${key}_${log.listName}_${suffix}.txt`
                            )
                          }
                        >
                          Exportar {label.toLowerCase()}
                        </Button>
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
