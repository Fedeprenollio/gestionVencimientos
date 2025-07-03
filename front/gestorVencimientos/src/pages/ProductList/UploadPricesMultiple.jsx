import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import UploadPricesResultByList from "../price/UploadPricesResultByList";

export default function UploadPricesMultiple() {
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
          price: parseFloat(String(row.Unitario).replace(",", ".")),
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
  console.log("RESULTA", result)
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Subir precios a <b>{selectedListIds.length}</b> listas seleccionadas
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

      {result && (
        <Box>
          <Typography variant="subtitle1" color="success.main">
            ✅ {result.message}
          </Typography>
          <Typography>Precios subidos: {result.priceIncreased?.length + result.priceDecreased?.length}</Typography>
          <Typography>Sin cambios: {result.priceUnchanged?.length}</Typography>
          <Typography>Primeros precios: {result.firstTimeSet?.length}</Typography>
          {/* <Typography>No estaban en ninguna lista: {result.notInAnyList?.length}</Typography> */}
        </Box>
      )}

             {result && <UploadPricesResultByList data={result} />}
      
    </Box>
  );
}

// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Collapse,
//   IconButton,
//   Button,
//   Paper,
// } from "@mui/material";
// import {
//   ExpandLess,
//   ExpandMore,
//   ArrowDropUp,
//   ArrowDropDown,
//   Remove,
// } from "@mui/icons-material";
// import { exportToTXT } from "../../../utils/exportUtils";
// import api from "../../api/axiosInstance";

// export default function UploadPricesMultiple({ data }) {
//   const [openSections, setOpenSections] = useState({});

//   const toggleSection = (key) => {
//     setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const Section = ({
//     title,
//     items,
//     icon,
//     color,
//     showOldNew = false,
//     priceKey = "price",
//   }) => {
//     if (!items || items.length === 0) return null;

//     return (
//       <Box mb={2} ml={2}>
//         <Box display="flex" alignItems="center" justifyContent="space-between">
//           <Typography variant="subtitle1" color={color}>
//             {title} ({items.length})
//           </Typography>
//           <IconButton onClick={() => toggleSection(title)}>
//             {openSections[title] ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>
//         <Collapse in={openSections[title]}>
//           <ul>
//             {items.map((p) => (
//               <li key={p.barcode}>
//                 {icon} {p.name || "Sin nombre"} ({p.barcode}):{' '}
//                 {showOldNew ? (
//                   <>
//                     ${p.oldPrice?.toFixed(2)} → <b>${p.newPrice?.toFixed(2)}</b>
//                   </>
//                 ) : (
//                   `$${p[priceKey]?.toFixed(2)}`
//                 )}
//               </li>
//             ))}
//           </ul>
//         </Collapse>
//       </Box>
//     );
//   };

//   const handleExportBarcodes = (items, listName) => {
//     const barcodes = items.map((p) => p.barcode);
//     exportToTXT(barcodes, `etiquetas_${listName.replace(/\s+/g, '_')}.txt`);
//   };

//   const updateLastTagDate = async (listId, barcodes) => {
//     try {
//       await api.post(`/product-lists/${listId}/update-last-tag-date`, {
//         barcodes,
//       });
//       alert("✅ Fecha de etiqueta actualizada");
//     } catch (err) {
//       console.error("Error actualizando lastTagDate", err);
//       alert("❌ Error actualizando la fecha de etiquetas");
//     }
//   };

//   if (!data || !data.lists || data.lists.length === 0) {
//     return <Typography>No hay resultados para mostrar.</Typography>;
//   }

//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         ✅ {data.message}
//       </Typography>

//       {data.lists.map((list) => (
//         <Paper
//           key={list.listId}
//           variant="outlined"
//           sx={{ p: 2, mb: 3, backgroundColor: "#f9f9f9" }}
//         >
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//             📦 Lista: {list.listName}
//           </Typography>

//           <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//             <Button
//               size="small"
//               variant="outlined"
//               onClick={() =>
//                 handleExportBarcodes(
//                   [
//                     ...list.priceIncreased,
//                     ...list.priceDecreased,
//                     ...list.firstTimeSet,
//                   ],
//                   list.listName
//                 )
//               }
//             >
//               Generar etiquetas .txt
//             </Button>

//             <Button
//               size="small"
//               color="primary"
//               variant="outlined"
//               onClick={() =>
//                 updateLastTagDate(
//                   list.listId,
//                   [
//                     ...list.priceIncreased,
//                     ...list.priceDecreased,
//                     ...list.firstTimeSet,
//                   ].map((p) => p.barcode)
//                 )
//               }
//             >
//               Marcar como reetiquetados
//             </Button>
//           </Box>

//           <Section
//             title="Precios que subieron"
//             items={list.priceIncreased}
//             icon={<ArrowDropUp color="success" />}
//             color="success.main"
//             showOldNew
//           />

//           <Section
//             title="Precios que bajaron"
//             items={list.priceDecreased}
//             icon={<ArrowDropDown color="error" />}
//             color="error.main"
//             showOldNew
//           />

//           <Section
//             title="Precios sin cambios"
//             items={list.priceUnchanged}
//             icon={<Remove />}
//             color="text.secondary"
//           />

//           <Section
//             title="Primeros precios"
//             items={list.firstTimeSet}
//             icon={<ArrowDropUp color="info" />}
//             color="info.main"
//             priceKey="newPrice"
//           />

//           <Section
//             title="Productos que estaban en la lista pero no en el Excel"
//             items={list.missingInExcel}
//             icon={<Remove />}
//             color="warning.main"
//           />
//         </Paper>
//       ))}

//       {data.notInAnyList?.length > 0 && (
//         <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
//           <Typography variant="subtitle1" color="error" gutterBottom>
//             Productos del Excel que no estaban en ninguna lista ({
//               data.notInAnyList.length
//             })
//           </Typography>
//           <ul>
//             {data.notInAnyList.map((p) => (
//               <li key={p.barcode}>
//                 {p.barcode}: ${p.price.toFixed(2)}
//               </li>
//             ))}
//           </ul>
//         </Paper>
//       )}
//     </Box>
//   );
// }
