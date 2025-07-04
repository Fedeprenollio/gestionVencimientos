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
// import { useNavigate } from "react-router-dom";

// export default function UploadPricesResultByList({ data }) {
//   const [openSections, setOpenSections] = useState({});
//   const navigate = useNavigate();

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
//                 {icon} {p.name || "Sin nombre"} ({p.barcode}):{" "}
//                 {showOldNew ? (
//                   <>
//                     ${p.oldPrice?.toFixed(2)} → <b>${p.newPrice?.toFixed(2)}</b>
//                   </>
//                 ) : (
//                   `$${p[priceKey]?.toFixed(2)}`
//                 )}{" "}
//                 {p.lastTagDate ? (
//                   <span style={{ color: "gray", fontSize: "0.85em" }}>
//                     — etiquetado el{" "}
//                     {new Date(p.lastTagDate).toLocaleDateString()}
//                   </span>
//                 ):"Sin etiquetado" } 
//               </li>
//             ))}
//           </ul>
//         </Collapse>
//       </Box>
//     );
//   };
//   const handleExportBarcodes = (items, listName) => {
//     const barcodes = items.map((p) => p.barcode);
//     exportToTXT(barcodes, `etiquetas_${listName.replace(/\s+/g, "_")}.txt`);
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
// console.log("barcodes",data)

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

//             {/* <Button
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
//             </Button> */}
//             <p>
//               La opción "Marcar como reetiquetado" Qué hace: Actualizar la fecha
//               del campo lastTagDate de los productos en la lista que hayan
//               tenido: priceIncreased priceDecreased firstTimeSet Esta fecha
//               sirve para indicar que esos productos ya fueron reetiquetados con
//               sus nuevos precios, y por lo tanto: No necesitan reimprimir
//               etiquetas nuevamente.
//             </p>
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
//             <Button
//             size="small"
//             variant="contained"
//             color="secondary"
//             onClick={() => navigate(`/lists/${list.listId}/products-to-retag`)}
//           >
//             Ver productos para reetiquetar
//           </Button>
//         </Paper>
//       ))}

      
//     </Box>
//   );
// }
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
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ArrowDropUp,
  ArrowDropDown,
  Remove,
  UploadFile,
} from "@mui/icons-material";
import { exportToTXT } from "../../../utils/exportUtils";
import api from "../../api/axiosInstance";
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
    if (!items || items.length === 0) return null;

    return (
      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="#f0f0f0"
          p={1}
          borderRadius={1}
        >
          <Typography variant="subtitle1" color={color}>
            {icon} {title} ({items.length})
          </Typography>
          <IconButton onClick={() => toggleSection(title)} size="small">
            {openSections[title] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={openSections[title]}>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Producto</strong></TableCell>
                  <TableCell><strong>Código</strong></TableCell>
                  {showOldNew && <TableCell align="right"><strong>Precio anterior</strong></TableCell>}
                  <TableCell align="right"><strong>Precio nuevo</strong></TableCell>
                  <TableCell><strong>Última etiqueta</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.barcode}>
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
                      {p.lastTagDate
                        ? new Date(p.lastTagDate).toLocaleDateString()
                        : <span style={{ color: "#999" }}>Sin etiquetado</span>}
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
      <Typography variant="h6" gutterBottom>
        ✅ {data.message}
      </Typography>

      {data.lists.map((list) => (
        <Paper
          key={list.listId}
          variant="outlined"
          sx={{ p: 2, mb: 4, backgroundColor: "#fafafa", borderRadius: 2 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              📦 Lista: {list.listName}
            </Typography>
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
              Exportar etiquetas .txt
            </Button>
          </Box>

          <Section
            title="Precios que subieron"
            items={list.priceIncreased}
            icon={<ArrowDropUp color="success" />}
            color="success.main"
            showOldNew
          />

          <Section
            title="Precios que bajaron"
            items={list.priceDecreased}
            icon={<ArrowDropDown color="error" />}
            color="error.main"
            showOldNew
          />

          <Section
            title="Primeros precios"
            items={list.firstTimeSet}
            icon={<ArrowDropUp color="info" />}
            color="info.main"
            priceKey="newPrice"
          />

          <Section
            title="Precios sin cambios"
            items={list.priceUnchanged}
            icon={<Remove />}
            color="text.secondary"
          />

          <Section
            title="Productos en la lista pero no en el Excel"
            items={list.missingInExcel}
            icon={<Remove />}
            color="warning.main"
          />

          <Box mt={2}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={() =>
                navigate(`/lists/${list.listId}/products-to-retag`)
              }
            >
              Ver productos para reetiquetar
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
