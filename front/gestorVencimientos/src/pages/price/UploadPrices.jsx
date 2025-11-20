

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ArrowDropUp,
  ArrowDropDown,
  Remove,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { exportToTXT } from "../../../utils/exportUtils";
import UploadPricesResultByList from "./UploadPricesResultByList";

export default function UploadPrices() {
  const { listId } = useParams();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  console.log("DATAA", data);
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      const formatted = parsed
        .map((row) => ({
          barcode: String(row.Codebar).trim(),
          price: parseFloat(String(row.Precio).replace(",", ".")),
        }))
        .filter((p) => p.barcode && !isNaN(p.price));

      const unique = Object.values(
        formatted.reduce((acc, cur) => {
          const key = `${cur.barcode}-${cur.price}`;
          if (!acc[key]) acc[key] = cur;
          return acc;
        }, {})
      );

      const res = await api.post(`/product-lists/${listId}/upload-prices`, {
        products: unique,
      });

      setData(res);
      setFile(null);
    } catch (error) {
      console.error("Error al subir precios:", error);
      alert("❌ Error al subir precios. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

 

  const Section = ({
  title,
  items,
  icon,
  color,
  priceKey = "price",
  showOldNew = false,
}) => {
  if (!items || items.length === 0) return null;

  const handleExport = () => {
    const codes = items.map((p) => p.barcode);
    const filename = `${title.replace(/\s+/g, "_").toLowerCase()}.txt`;
    exportToTXT(codes, filename);
  };
  console.log("FATA", data)
  return (
    <Box mb={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" color={color}>
          {title} ({items.length})
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            onClick={handleExport}
            sx={{ textTransform: "none" }}
          >
            Exportar .txt
          </Button>
          <IconButton onClick={() => toggleSection(title)}>
            {openSections[title] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={openSections[title]}>
        <ul style={{ marginLeft: "1rem" }}>
          {items.map((p) => (
            <li key={p.barcode}>
              {icon} {p.name || "Sin nombre"} ({p.barcode}):{" "}
              {showOldNew ? (
                <>
                  ${p.oldPrice?.toFixed(2)} → <b>${p.newPrice?.toFixed(2)}</b>
                </>
              ) : (
                `$${p[priceKey]?.toFixed(2)}`
              )}
            </li>
          ))}
        </ul>
      </Collapse>
    </Box>
  );
};

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Subir precios para la lista <b>{listId}</b>
      </Typography>

      <Paper
        variant="outlined"
        sx={{ border: "2px dashed #ccc", p: 3, textAlign: "center", mb: 4 }}
      >
        <Typography variant="body1" mb={1}>
          Seleccioná un archivo Excel (.xlsx o .xls) con columnas:{" "}
          <b>Codebar</b> y <b>Unitario</b>
        </Typography>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        {file && (
          <Typography variant="body2" mt={1}>
            Archivo seleccionado: {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? <CircularProgress size={20} /> : "Subir precios"}
        </Button>
      </Paper>

      {data && (
        <>
          <Typography variant="subtitle1" color="success.main" mb={2}>
            ✅ {data.message}
          </Typography>

          <Section
            title="Precios que subieron"
            items={data.priceIncreased}
            icon={<ArrowDropUp color="success" />}
            color="success.main"
            showOldNew
          />

          <Section
            title="Precios que bajaron"
            items={data.priceDecreased}
            icon={<ArrowDropDown color="error" />}
            color="error.main"
            showOldNew
          />

          <Section
            title="Precios sin cambios"
            items={data.priceUnchanged}
            icon={<Remove />}
            color="text.secondary"
          />
          <Section
            title="Productos con primer precio"
            items={data.firstTimeSet}
            icon={<ArrowDropUp color="info" />} // Usá el ícono que quieras
            color="info.main"
            priceKey="newPrice"
          />
          <Section
            title="Productos en la lista que no vinieron en el Excel"
            items={data.missingInExcel}
            icon={<Remove />}
            color="warning.main"
          />
          

          {/* Si querés loguear los que no están en la lista */}
          {/* <Section
            title="Productos del Excel que no estaban en la lista"
            items={data.notInList}
            icon={<HelpOutline />}
            color="text.disabled"
          /> */}
        </>
      )}

       {/* {data && <UploadPricesResultByList data={data} />} */}
    </Box>
  );
}
