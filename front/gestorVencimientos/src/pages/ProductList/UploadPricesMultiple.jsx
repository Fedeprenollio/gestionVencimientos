// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Paper,
//   CircularProgress,
//   Alert,
//   Divider,
// } from "@mui/material";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
// import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
// import * as XLSX from "xlsx";
// import { useLocation } from "react-router-dom";
// import api from "../../api/axiosInstance";
// import UploadPricesResultByList from "../price/UploadPricesResultByList";

// export default function UploadPricesMultiple() {
//   const location = useLocation();
//   const selectedListIds = location.state?.selectedListIds || [];
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState(null);

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     if (f) setFile(f);
//   };

//   const handleUpload = async () => {
//     if (!file || selectedListIds.length === 0) return;

//     try {
//       setUploading(true);
//       const dataBuffer = await file.arrayBuffer();
//       const workbook = XLSX.read(dataBuffer);
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const parsed = XLSX.utils.sheet_to_json(sheet);

//       const formatted = parsed
//         .map((row) => ({
//           barcode: String(row.Codebar).trim(),
//           price: parseFloat(String(row.Unitario).replace(",", ".")),
//         }))
//         .filter((p) => p.barcode && !isNaN(p.price));

//       const unique = Object.values(
//         formatted.reduce((acc, cur) => {
//           const key = `${cur.barcode}-${cur.price}`;
//           if (!acc[key]) acc[key] = cur;
//           return acc;
//         }, {})
//       );

//       const res = await api.post(`/product-lists/upload-prices-multiple`, {
//         listIds: selectedListIds,
//         products: unique,
//       });

//       setResult(res);
//     } catch (error) {
//       console.error("Error al subir precios:", error);
//       alert("❌ Error al subir precios");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Box p={3}>
//       <Paper sx={{ p: 3, mb: 3, bgcolor: "#f5f5f5" }} elevation={1}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           📦 Subir precios a {selectedListIds.length} lista
//           {selectedListIds.length > 1 ? "s" : ""}
//         </Typography>
//         <Typography variant="body1" color="text.secondary">
//           Asegurate de cargar un archivo con columnas: <b>Codebar</b> y{" "}
//           <b>Unitario</b>.
//         </Typography>
//       </Paper>

//       <Paper
//         variant="outlined"
//         sx={{ border: "2px dashed #bbb", p: 3, textAlign: "center", mb: 4 }}
//       >
//         <input
//           type="file"
//           accept=".xlsx,.xls"
//           onChange={handleFileChange}
//           id="upload-input"
//           style={{ display: "none" }}
//         />
//         <label htmlFor="upload-input">
//           <Button
//             variant="outlined"
//             component="span"
//             startIcon={<UploadFileIcon />}
//           >
//             Seleccionar archivo
//           </Button>
//         </label>

//         {file && (
//           <Typography mt={2} display="flex" alignItems="center" gap={1}>
//             <InsertDriveFileIcon color="primary" />
//             {file.name}
//           </Typography>
//         )}

//         <Box mt={2}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleUpload}
//             disabled={!file || uploading}
//           >
//             {uploading ? (
//               <CircularProgress size={20} />
//             ) : (
//               <>
//                 <UploadFileIcon fontSize="small" />
//                 &nbsp;Subir precios
//               </>
//             )}
//           </Button>
//         </Box>
//       </Paper>

//       {result && (
//         <Alert severity="success" icon={<DoneOutlineIcon />} sx={{ mb: 3 }}>
//           {result.message}
//         </Alert>
//       )}

//       {result && (
//         <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//             📊 Resumen de cambios
//           </Typography>
//           <Typography color="success.main">
//             🔺 Aumentos: {result.priceIncreased?.length || 0}
//           </Typography>
//           <Typography color="error.main">
//             🔻 Bajas: {result.priceDecreased?.length || 0}
//           </Typography>
//           <Typography color="text.secondary">
//             ➖ Sin cambios: {result.priceUnchanged?.length || 0}
//           </Typography>
//           <Typography color="info.main">
//             🆕 Primeros precios: {result.firstTimeSet?.length || 0}
//           </Typography>
//         </Paper>
//       )}

//       {result && <UploadPricesResultByList data={result} />}
//     </Box>
//   );
// }

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";

import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import UploadPricesResultByList from "../price/UploadPricesResultByList";
import { ArrowCircleUp, ArrowCircleDown, FiberNew } from "@mui/icons-material";

export default function UploadPricesMultiple() {
  const location = useLocation();
  const selectedListIds = location.state?.selectedListIds || [];
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const groupLabels = {
    priceIncreased: {
      label: "Aumentos",
      color: "success",
      icon: (
        <ArrowCircleUp
          fontSize="small"
          sx={{ mr: 0.5, verticalAlign: "middle" }}
        />
      ),
    },
    priceDecreased: {
      label: "Bajas",
      color: "error",
      icon: (
        <ArrowCircleDown
          fontSize="small"
          sx={{ mr: 0.5, verticalAlign: "middle" }}
        />
      ),
    },
    firstTimeSet: {
      label: "Primeros precios",
      color: "info",
      icon: (
        <FiberNew fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
      ),
    },
  };
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file || selectedListIds.length === 0) return;

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

      const res = await api.post(`/product-lists/upload-prices-multiple`, {
        listIds: selectedListIds,
        products: unique,
      });

      setResult(res);
    } catch (error) {
      console.error("Error al subir precios:", error);
      alert("❌ Error al subir precios");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={3}>
      {/* Título con icono y tipografía similar a UploadLogs */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <UploadFileIcon color="primary" fontSize="large" />
        <Typography variant="h5" color="primary" fontWeight={600}>
          Subir precios a {selectedListIds.length} lista
          {selectedListIds.length > 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Explicación simple y limpia */}
      <Typography variant="body1" color="text.secondary" mb={3}>
        Asegurate de cargar un archivo con columnas: <b>Codebar</b> y{" "}
        <b>Precio</b>.
      </Typography>

      {/* Área de carga de archivo */}
      <Paper
        variant="outlined"
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          p: 3,
          textAlign: "center",
          mb: 4,
          borderRadius: 2,
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          id="upload-input"
          style={{ display: "none" }}
        />
        <label htmlFor="upload-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadFileIcon />}
            sx={{ textTransform: "none" }}
          >
            Seleccionar archivo
          </Button>
        </label>

        {file && (
          <Typography
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            color="text.primary"
          >
            <InsertDriveFileIcon color="primary" />
            {file.name}
          </Typography>
        )}

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={<UploadFileIcon />}
            sx={{ textTransform: "none" }}
          >
            {uploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Subir precios"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Resultado resumido con alert y colores similares */}
      {result && (
        <Alert severity="success" icon={<DoneOutlineIcon />} sx={{ mb: 3 }}>
          {result.message}
        </Alert>
      )}

      {/* Resumen de cambios con colores e íconos coherentes */}
   {result && (
  <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
      📊 Resumen de cambios
    </Typography>
    <Box display="flex" flexDirection="column" gap={1} mt={1}>
      <Box display="flex" alignItems="center" color="success.main">
        <ArrowCircleUp sx={{ mr: 1 }} />
        <Typography variant="body1">
          Aumentos: <strong>{result.priceIncreased?.length || 0}</strong>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" color="error.main">
        <ArrowCircleDown sx={{ mr: 1 }} />
        <Typography variant="body1">
          Bajas: <strong>{result.priceDecreased?.length || 0}</strong>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" color="text.secondary">
        <Typography sx={{ mr: 1 }}>➖</Typography>
        <Typography variant="body1">
          Sin cambios: <strong>{result.priceUnchanged?.length || 0}</strong>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" color="info.main">
        <FiberNew sx={{ mr: 1 }} />
        <Typography variant="body1">
          Primeros precios: <strong>{result.firstTimeSet?.length || 0}</strong>
        </Typography>
      </Box>
    </Box>
  </Paper>
)}


      {result && <UploadPricesResultByList data={result} />}
    </Box>
  );
}
