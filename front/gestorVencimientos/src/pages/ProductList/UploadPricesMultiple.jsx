// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Paper,
//   CircularProgress,
//   Alert,
//   Chip,
// } from "@mui/material";
// import UploadFileIcon from "@mui/icons-material/UploadFile";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
// import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
// import { TrendingUp, TrendingDown, NewReleases } from "@mui/icons-material";

// import * as XLSX from "xlsx";
// import { useLocation } from "react-router-dom";
// import api from "../../api/axiosInstance";
// import UploadPricesResultByList from "../price/UploadPricesResultByList";
// import useBranchStore from "../../store/useBranchStore";
// import SucursalSelector from "../../components/SucursalSelector";

// export default function UploadPricesMultiple() {
//   const { selectedBranchId } = useBranchStore((state) => state);

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
//     console.log(" brnacj id", selectedBranchId);
//     if (selectedListIds.length === 0 || !selectedBranchId) {
//       alert("Faltan datos: archivo, listas o sucursal");
//       return;
//     }
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
//           stock: Number(row.Cantidad) || 0,
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
//         branchId: selectedBranchId,
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
//       <Box display="flex" alignItems="center" mb={3} gap={1}>
//         <UploadFileIcon color="primary" fontSize="large" />
//         <Typography variant="h5" color="primary" fontWeight="bold">
//           Subir precios a {selectedListIds.length} lista
//           {selectedListIds.length > 1 ? "s" : ""}
//         </Typography>
//       </Box>
//       <SucursalSelector />
//       <Box mb={3}>
//         <Typography variant="body1" color="text.secondary">
//           El archivo Excel debe tener las siguientes columnas:
//         </Typography>
//         <ul style={{ marginTop: 8, marginLeft: 16 }}>
//           <li>
//             <b>Codebar</b>: código de barras del producto
//           </li>
//           <li>
//             <b>Unitario</b>: precio unitario actualizado
//           </li>
//           <li>
//             <b>Cantidad</b>: stock actualizado 
//           </li>
//         </ul>
//       </Box>

//       <Paper
//         variant="outlined"
//         sx={{
//           border: "2px dashed",
//           borderColor: "divider",
//           p: 3,
//           textAlign: "center",
//           mb: 4,
//           borderRadius: 2,
//         }}
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
//           <Typography
//             mt={2}
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             gap={1}
//           >
//             <InsertDriveFileIcon color="primary" />
//             {file.name}
//           </Typography>
//         )}

//         <Box mt={3}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleUpload}
//             disabled={!file || uploading}
//             startIcon={<UploadFileIcon />}
//           >
//             {uploading ? (
//               <CircularProgress size={20} color="inherit" />
//             ) : (
//               "Subir precios"
//             )}
//           </Button>
//         </Box>
//       </Paper>

//       {result && (
//         <Alert severity="success" icon={<DoneOutlineIcon />} sx={{ mb: 3 }}>
//           {result.message}
//         </Alert>
//       )}

//       {result?.lists?.length > 0 && (
//         <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
//           <Typography variant="h6" gutterBottom>
//             Resumen de cambios por lista
//           </Typography>

//           {result.lists.map((list, idx) => (
//             <Box key={idx} mb={2}>
//               <Typography variant="subtitle1" gutterBottom>
//                 📋 {list.listName}
//               </Typography>

//               <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
//                 <Chip
//                   label={`Aumentos: ${list.priceIncreased?.length || 0}`}
//                   color="success"
//                   size="small"
//                   icon={<TrendingUp fontSize="small" />}
//                 />
//                 <Chip
//                   label={`Bajas: ${list.priceDecreased?.length || 0}`}
//                   color="error"
//                   size="small"
//                   icon={<TrendingDown fontSize="small" />}
//                 />
//                 <Chip
//                   label={`Sin cambios: ${list.priceUnchanged?.length || 0}`}
//                   color="default"
//                   size="small"
//                 />
//                 <Chip
//                   label={`Primeros precios: ${list.firstTimeSet?.length || 0}`}
//                   color="info"
//                   size="small"
//                   icon={<NewReleases fontSize="small" />}
//                 />
//               </Box>
//             </Box>
//           ))}
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
  Chip,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import { TrendingUp, TrendingDown, NewReleases } from "@mui/icons-material";

import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import UploadPricesResultByList from "../price/UploadPricesResultByList";
import useBranchStore from "../../store/useBranchStore";
import SucursalSelector from "../../components/SucursalSelector";
import UpdateFromImportForm from "./UpdateFromImportForm"; // ✅ nuevo componente

export default function UploadPricesMultiple() {
  const { selectedBranchId } = useBranchStore((state) => state);
  const location = useLocation();
  const selectedListIds = location.state?.selectedListIds || [];

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (selectedListIds.length === 0 || !selectedBranchId) {
      alert("Faltan datos: archivo, listas o sucursal");
      return;
    }

    try {
      setUploading(true);
      const dataBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(dataBuffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      const formatted = parsed
        .map((row) => ({
          barcode: String(row.Codebar).trim(),
          price: parseFloat(String(row.Unitario).replace(",", ".")),
          stock: Number(row.Cantidad) || 0,
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
        branchId: selectedBranchId,
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
      {/* <Box display="flex" alignItems="center" mb={3} gap={1}>
        <UploadFileIcon color="primary" fontSize="large" />
        <Typography variant="h5" color="primary" fontWeight="bold">
          Subir precios a {selectedListIds.length} lista
          {selectedListIds.length > 1 ? "s" : ""}
        </Typography>
      </Box> */}

      {/* <SucursalSelector /> */}

      {/* <Box mb={3}>
        <Typography variant="body1" color="text.secondary">
          El archivo Excel debe tener las siguientes columnas:
        </Typography>
        <ul style={{ marginTop: 8, marginLeft: 16 }}>
          <li>
            <b>Codebar</b>: código de barras del producto
          </li>
          <li>
            <b>Unitario</b>: precio unitario actualizado
          </li>
          <li>
            <b>Cantidad</b>: stock actualizado
          </li>
        </ul>
      </Box> */}

      {/* <Paper
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
          >
            {uploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Subir precios"
            )}
          </Button>
        </Box>
      </Paper> */}

      {result && (
        <Alert severity="success" icon={<DoneOutlineIcon />} sx={{ mb: 3 }}>
          {result.message}
        </Alert>
      )}

      {result?.lists?.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            Resumen de cambios por lista
          </Typography>

          {result.lists.map((list, idx) => (
            <Box key={idx} mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                📋 {list.listName}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                <Chip
                  label={`Aumentos: ${list.priceIncreased?.length || 0}`}
                  color="success"
                  size="small"
                  icon={<TrendingUp fontSize="small" />}
                />
                <Chip
                  label={`Bajas: ${list.priceDecreased?.length || 0}`}
                  color="error"
                  size="small"
                  icon={<TrendingDown fontSize="small" />}
                />
                <Chip
                  label={`Sin cambios: ${list.priceUnchanged?.length || 0}`}
                  color="default"
                  size="small"
                />
                <Chip
                  label={`Primeros precios: ${list.firstTimeSet?.length || 0}`}
                  color="info"
                  size="small"
                  icon={<NewReleases fontSize="small" />}
                />
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {result && <UploadPricesResultByList data={result} />}

      <Divider sx={{ my: 4 }} />

      {/* ✅ Nueva sección */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
         Actualizar listas desde una importación previa de stock
        </Typography>
        
        <UpdateFromImportForm data={result}  setResult={setResult}/>
      </Box> 
    </Box>
  );
}
