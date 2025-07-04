import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import api from "../../api/axiosInstance";
import { exportToTXT } from "../../../utils/exportUtils";

export default function PriceComparisonByDate({ listId }) {
  const [compareDate, setCompareDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Paginación
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/product-lists/${listId}/compare-prices?date=${compareDate}`
      );
      setProducts(res.products || []);
      setTotalProducts(res.products?.length || 0);
      setPage(0); // reset pag
    } catch (err) {
      console.error("Error fetching price comparison", err);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listId) fetchComparison();
  }, [listId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDateChange = (e) => {
    setCompareDate(e.target.value);
  };

  const exportCodes = () => {
    const filtered = products.filter((p) => p.needsRetag);
    const barcodes = filtered.map((p) => p.barcode);
    const fileName = `retag_${dayjs(compareDate).format("YYYYMMDD")}.txt`;

    if (barcodes.length === 0) {
      alert("No hay productos que necesiten reetiquetado.");
      return;
    }

    exportToTXT(barcodes, fileName);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Comparar precios por fecha
      </Typography>

      <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          label="Fecha comparación"
          type="date"
          value={compareDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={fetchComparison}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Comparar"}
        </Button>
      </Box>

      {!loading && products.length === 0 && (
        <Typography>
          No se encontraron productos para la fecha seleccionada.
        </Typography>
      )}

      {loading && <CircularProgress />}

      {!loading && products.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="right">
                  Precio en {dayjs(compareDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="right">Precio actual</TableCell>
                <TableCell align="center">¿Reetiquetar?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(
                  ({
                    barcode,
                    name,
                    priceAtDate,
                    currentPrice,
                    needsRetag,
                  }) => (
                    <TableRow
                      key={barcode}
                      sx={{
                        backgroundColor: needsRetag ? "#fff3e0" : "inherit",
                      }}
                    >
                      <TableCell>{name}</TableCell>
                      <TableCell>{barcode}</TableCell>
                      <TableCell align="right">
                        {priceAtDate !== null
                          ? `$${priceAtDate.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {currentPrice !== null
                          ? `$${currentPrice.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {needsRetag ? (
                          <Typography color="warning.main" fontWeight="bold">
                            Sí
                          </Typography>
                        ) : (
                          "No"
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={totalProducts}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </TableContainer>
      )}
      <Button
        variant="outlined"
        onClick={exportCodes}
        disabled={products.filter((p) => p.needsRetag).length === 0}
      >
        Exportar etiquetas necesarias
      </Button>
    </Box>
  );
}
