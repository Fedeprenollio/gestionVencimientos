import React, { useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  UploadFile,
  ArrowCircleUp,
  ArrowCircleDown,
  RemoveCircleOutline,
  FiberNew,
  Inventory2,
} from "@mui/icons-material";
import { exportToTXT } from "../../../utils/exportUtils";
import { useNavigate } from "react-router-dom";

export default function UploadPricesResultByList({ data }) {
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Section = ({
    title,
    items,
    icon,
    color,
    showOldNew = false,
    priceKey = "price",
  }) => {
    const [sortByStockAsc, setSortByStockAsc] = useState(false);

    if (!items || items.length === 0) return null;

    const isStockSection = items.some(
      (p) => p.quantity !== undefined || p.stock !== undefined
    );

    const sortedItems = isStockSection
      ? [...items].sort((a, b) => {
          const aQty = a.quantity ?? a.stock ?? 0;
          const bQty = b.quantity ?? b.stock ?? 0;
          return sortByStockAsc ? aQty - bQty : bQty - aQty;
        })
      : items;

    return (
      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="#f5f5f5"
          px={2}
          py={1}
          borderRadius={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="subtitle1" fontWeight={600} color={color}>
              {title}
            </Typography>
            <Chip label={`${items.length}`} size="small" color="default" />
          </Box>
          <IconButton onClick={() => toggleSection(title)} size="small">
            {openSections[title] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={openSections[title]}>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  {isStockSection && (
                    <TableCell
                      onClick={() => setSortByStockAsc((prev) => !prev)}
                      sx={{ cursor: "pointer" }}
                    >
                      <strong>Stock {sortByStockAsc ? "▲" : "▼"}</strong>
                    </TableCell>
                  )}
                  <TableCell>
                    <strong>Producto</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Código</strong>
                  </TableCell>
                  {showOldNew && (
                    <TableCell align="right">
                      <strong>Precio anterior</strong>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <strong>Precio nuevo</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Última etiqueta</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedItems.map((p) => (
                  <TableRow key={p.barcode}>
                    {isStockSection && (
                      <TableCell align="right">
                        {p.quantity ?? p.stock ?? "-"}
                      </TableCell>
                    )}
                    <TableCell>{p.name || "Sin nombre"}</TableCell>
                    <TableCell>{p.barcode}</TableCell>
                    {showOldNew && (
                      <TableCell align="right">
                        ${p.oldPrice?.toFixed(2)}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      ${p.newPrice?.toFixed(2) || p[priceKey]?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {p.lastTagDate ? (
                        new Date(p.lastTagDate).toLocaleDateString()
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin etiquetado
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Box>
    );
  };

  const handleExportBarcodes = (items, listName) => {
    const barcodes = items.map((p) => p.barcode);
    exportToTXT(barcodes, `etiquetas_${listName.replace(/\s+/g, "_")}.txt`);
  };

  if (!data || !data.lists || data.lists.length === 0) {
    return <Typography>No hay resultados para mostrar.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
        ✅ {data.message}
      </Typography>

      {data.lists.map((list) => (
        <Paper
          key={list.listId}
          variant="outlined"
          sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#fcfcfc" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Inventory2 color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Lista: {list.listName}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() =>
                handleExportBarcodes(
                  [
                    ...list.priceIncreased,
                    ...list.priceDecreased,
                    ...list.firstTimeSet,
                  ],
                  list.listName
                )
              }
            >
              Exportar etiquetas
            </Button>
          </Box>

          <Section
            title="Aumentos"
            items={list.priceIncreased}
            icon={<ArrowCircleUp color="success" />}
            color="success.main"
            showOldNew
          />

          <Section
            title="Bajas"
            items={list.priceDecreased}
            icon={<ArrowCircleDown color="error" />}
            color="error.main"
            showOldNew
          />

          <Section
            title="Primeros precios"
            items={list.firstTimeSet}
            icon={<FiberNew color="info" />}
            color="info.main"
            priceKey="newPrice"
          />

          <Section
            title="Sin cambios"
            items={list.priceUnchanged}
            icon={<RemoveCircleOutline color="disabled" />}
            color="text.secondary"
          />

          <Section
            title="No encontrados en Excel"
            items={list.missingInExcel}
            icon={<RemoveCircleOutline color="warning" />}
            color="warning.main"
          />
          {/* <Section
            title="Stock actualizado"
            items={list.stockUpdated}
            icon={<Inventory2 color="secondary" />}
            color="secondary.main"
            priceKey="quantity"
          /> */}

          {/* <Box mt={2}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() =>
                navigate(`/lists/${list.listId}/products-to-retag`)
              }
            >
              Ver productos para reetiquetar
            </Button>
          </Box> */}
        </Paper>
      ))}
    </Box>
  );
}
