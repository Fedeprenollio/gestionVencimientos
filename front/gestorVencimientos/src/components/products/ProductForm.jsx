

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import BarcodeScanner from "../barcodeScanner/BarcodeScanner.jsx";
// import {
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Box,
//   Typography,
//   Grid,
//   Autocomplete,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   DialogTitle,
//   Dialog,
//   DialogContent,
// } from "@mui/material";
// import SucursalSelector from "./SucursalSelector.jsx";
// import LotForm from "../lots/formularios/LotForm.jsx";
// import CreatedLotsTable from "../lots/CreatedLotsTable.jsx";
// import BarcodeSearchSection from "../lots/BarcodeSearchSection.jsx";
// import useSnackbar from "../../hooks/useSnackbar.js";
// import AppSnackbar from "../shared/AppSnackbar.jsx";
// import { parseGS1Barcode } from "../../../utils/BarcodeParser.js";

// export default function ProductForm() {
//   const [barcode, setBarcode] = useState("");
//   const [productExists, setProductExists] = useState(null);

//   const [productInfo, setProductInfo] = useState({
//     name: "",
//     type: "medicamento",
//     id: "",
//   });

//   const [quantity, setQuantity] = useState(1);

//   const [expMonth, setExpMonth] = useState(() => {
//     return localStorage.getItem("ultimo_mes_vencimiento") || "";
//   });

//   const [expYear, setExpYear] = useState(() => {
//     return localStorage.getItem("ultimo_anio_vencimiento") || "";
//   });

//   const [scanning, setScanning] = useState(false);

//   const [branch, setBranch] = useState(() => {
//     return localStorage.getItem("selectedBranch") || "sucursal1";
//   });

//   const [nameQuery, setNameQuery] = useState("");
//   const [nameResults, setNameResults] = useState([]);
//   const [overstock, setOverstock] = useState(false);

//   const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

//   const [createdLots, setCreatedLots] = useState(() => {
//     const saved = localStorage.getItem("lotes_jornada");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [showCreateModal, setShowCreateModal] = useState(false);

//   const barcodeInputRef = useRef(null);

//   // ============================================================
//   // LISTAS DE VENCIMIENTOS
//   // ============================================================

//   const [expirationLists, setExpirationLists] = useState([]);
//   const [selectedExpirationList, setSelectedExpirationList] = useState(
//     () => localStorage.getItem("selectedExpirationList") || ""
//   );

//   const [newListName, setNewListName] = useState("");
//   const [showListModal, setShowListModal] = useState(false);

//   // ============================================================
//   // DUPLICADO
//   // ============================================================

//   const [duplicateLot, setDuplicateLot] = useState(null);
//   const [showDuplicateModal, setShowDuplicateModal] = useState(false);

//   // ============================================================
//   // RECORDAR MES Y AÑO
//   // ============================================================

//   useEffect(() => {
//     if (expMonth) {
//       localStorage.setItem("ultimo_mes_vencimiento", expMonth);
//     }
//   }, [expMonth]);

//   useEffect(() => {
//     if (expYear) {
//       localStorage.setItem("ultimo_anio_vencimiento", expYear);
//     }
//   }, [expYear]);

//   // ============================================================
//   // GUARDAR LOTES DE LA JORNADA
//   // ============================================================

//   useEffect(() => {
//     localStorage.setItem("lotes_jornada", JSON.stringify(createdLots));
//   }, [createdLots]);

//   const clearLots = () => {
//     setCreatedLots([]);
//     localStorage.removeItem("lotes_jornada");
//   };

//   // ============================================================
//   // OBTENER LISTAS DE LA SUCURSAL
//   // ============================================================

//  useEffect(() => {
//   if (!branch) return;

//   const cargarListas = async () => {
//     try {
//       const res = await axios.get(
//   `${import.meta.env.VITE_API_URL}/expiration-lists/branch/${branch}`
// );

//       const lists = res.data.lists || [];

//       setExpirationLists(lists);

//       const savedListId = localStorage.getItem(
//         "selectedExpirationList"
//       );

//       const savedListExists = lists.some(
//         (list) => list._id === savedListId
//       );

//       if (savedListExists) {
//         setSelectedExpirationList(savedListId);
//       } else {
//         localStorage.removeItem("selectedExpirationList");
//         setSelectedExpirationList("");
//       }
//     } catch (err) {
//       console.error(
//         "Error obteniendo listas de vencimientos:",
//         err
//       );
//     }
//   };

//   cargarListas();
// }, [branch]);

//   // ============================================================
//   // CAMBIAR LISTA
//   // ============================================================

//   const handleExpirationListChange = (value) => {
//     setSelectedExpirationList(value);

//     if (value) {
//       localStorage.setItem("selectedExpirationList", value);
//     } else {
//       localStorage.removeItem("selectedExpirationList");
//     }
//   };

//   // ============================================================
//   // CREAR NUEVA LISTA
//   // ============================================================

//   const crearLista = async () => {
//     const nombre = newListName.trim();

//     if (!nombre) {
//       showSnackbar("Ingresá un nombre para la lista", "warning");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/expiration-lists`,
//         {
//           name: nombre,
//           branch,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const nuevaLista = res.data.list;

//       setExpirationLists((prev) => [nuevaLista, ...prev]);

//       setSelectedExpirationList(nuevaLista._id);

//       localStorage.setItem(
//         "selectedExpirationList",
//         nuevaLista._id
//       );

//       setNewListName("");
//       setShowListModal(false);

//       showSnackbar("Lista creada correctamente", "success");
//     } catch (err) {
//       console.error("Error creando lista:", err);

//       showSnackbar(
//         err.response?.data?.message || "Error al crear la lista",
//         "error"
//       );
//     }
//   };

//   // ============================================================
//   // BUSCAR PRODUCTOS POR NOMBRE
//   // ============================================================

//   useEffect(() => {
//     if (nameQuery.length < 2) return;

//     const delayDebounce = setTimeout(async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_API_URL}/products/search?name=${nameQuery}`
//         );

//         setNameResults(res.data);
//       } catch (err) {
//         console.error("Error buscando por nombre:", err);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounce);
//   }, [nameQuery]);

//   // ============================================================
//   // BUSCAR PRODUCTO POR CÓDIGO
//   // ============================================================

//   const handleSearch = async (code) => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/products/${code}`
//       );

//       setProductExists(true);

//       setProductInfo((prev) => ({
//         ...prev,
//         id: res.data._id,
//         name: res.data.name,
//         type: res.data.type,
//       }));
//     } catch (err) {
//       setProductExists(false);

//       setProductInfo({
//         name: "",
//         type: "medicamento",
//         id: "",
//       });

//       setShowCreateModal(true);
//     }
//   };

//   // ============================================================
//   // CÓDIGO DETECTADO POR SCANNER
//   // ============================================================

//   const handleDetected = (code) => {
//     setScanning(false);

//     if (code.length > 20) {
//       const parsed = parseGS1Barcode(code);

//       console.log("🧾 Código QR parseado:", parsed);

//       let gtin = parsed.gtin;

//       if (gtin?.length === 14 && /^[01]/.test(gtin)) {
//         gtin = gtin.slice(1);
//       }

//       if (gtin) {
//         setBarcode(gtin);
//         handleSearch(gtin);
//       } else {
//         setBarcode(code);
//         handleSearch(code);
//       }

//       if (
//         parsed.expirationDate instanceof Date &&
//         !isNaN(parsed.expirationDate)
//       ) {
//         const date = parsed.expirationDate;

//         setExpMonth(
//           String(date.getMonth() + 1).padStart(2, "0")
//         );

//         setExpYear(String(date.getFullYear()));
//       }

//       setProductInfo((prev) => ({
//         ...prev,
//         expirationDate: parsed.expirationDate,
//         batchNumber: parsed.batchNumber,
//         serialNumber: parsed.serialNumber,
//         gtin,
//       }));
//     } else {
//       setBarcode(code);
//       handleSearch(code);
//     }
//   };

//   // ============================================================
//   // CREAR LOTE
//   // ============================================================

//   const submit = async () => {
//     try {
//       // Verificar que haya una lista seleccionada
//       if (!selectedExpirationList) {
//         showSnackbar(
//           "Primero seleccioná una lista de vencimientos",
//           "warning"
//         );

//         return;
//       }

//       let pid = productInfo.id;

//       // Si no existe el producto, crear primero
//       if (!productExists) {
//         const res = await axios.post(
//           `${import.meta.env.VITE_API_URL}/products`,
//           {
//             name: productInfo.name,
//             barcode,
//             type: productInfo.type,
//           }
//         );

//         pid = res.data.product._id;

//         setProductExists(true);
//       }

//       // Crear fecha de vencimiento
//       const expirationDate = new Date(
//         `${expYear}-${expMonth}-01`
//       ).toISOString();

//       // Payload del lote
//       const lotePayload = {
//         productId: pid,
//         expirationDate,
//         quantity: Number(quantity),
//         branch,
//         overstock,
//         batchNumber: productInfo.batchNumber,
//         serialNumber: productInfo.serialNumber,
//         expirationListId: selectedExpirationList,
//       };

//       const loteRes = await axios.post(
//         `${import.meta.env.VITE_API_URL}/lots`,
//         lotePayload,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       console.log("Lote creado:", loteRes.data);

//       const lote = loteRes.data.lot;

//       lote.product = {
//         name: productInfo.name,
//         barcode,
//         type: productInfo.type,
//       };

//       setCreatedLots((prev) => [lote, ...prev]);

//       showSnackbar("Vencimiento agregado correctamente", "success");
//     } catch (err) {
//       console.error("Error:", err);

//       // ========================================================
//       // LOTE DUPLICADO
//       // ========================================================

//       if (err.response?.status === 409) {
//         const loteDuplicado = err.response.data?.lot;

//         setDuplicateLot({
//           ...loteDuplicado,
//           requestedQuantity: Number(quantity),
//           productName: productInfo.name,
//           expirationDate: new Date(
//             `${expYear}-${expMonth}-01`
//           ),
//         });

//         setShowDuplicateModal(true);

//         return;
//       }

//       showSnackbar(
//         err.response?.data?.message || "Error al crear lote",
//         "error"
//       );
//     }
//   };

//   // ============================================================
//   // CREAR PRODUCTO NUEVO
//   // ============================================================

//   const crearProducto = async () => {
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/products`,
//         {
//           name: productInfo.name,
//           barcode,
//           type: productInfo.type,
//         }
//       );

//       setProductInfo((prev) => ({
//         ...prev,
//         id: res.data.product._id,
//       }));

//       setProductExists(true);
//       setShowCreateModal(false);

//       showSnackbar(
//         "Producto creado correctamente!",
//         "success"
//       );
//     } catch (err) {
//       console.error("Error creando producto:", err);

//       showSnackbar(
//         "Error al crear producto",
//         "error"
//       );
//     }
//   };

//   // ============================================================
//   // CAMBIAR SUCURSAL
//   // ============================================================

//   const handleBranchChange = (value) => {
//     setBranch(value);

//     localStorage.setItem("selectedBranch", value);

//     // La lista debe volver a seleccionarse para la nueva sucursal
//     setSelectedExpirationList("");

//     localStorage.removeItem("selectedExpirationList");

//     setExpirationLists([]);
//   };

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         pt: 2,
//         minHeight: "100vh",
//         bgcolor: "background.default",
//       }}
//     >
//       <SucursalSelector
//         branch={branch}
//         onBranchChange={handleBranchChange}
//       />

//       <Box
//         sx={{
//           width: "100%",
//           maxWidth: { xs: 700, sm: 900, md: 1000 },
//           mx: "auto",
//           minHeight: "100vh",
//           p: 2,
//           bgcolor: "background.paper",
//           borderRadius: 1,
//           boxShadow: 1,
//         }}
//       >
//         <Typography variant="h6" gutterBottom>
//           Agregar vencimientos
//         </Typography>

//         {/* ====================================================
//             LISTA DE VENCIMIENTOS
//         ==================================================== */}

//         <Box
//           sx={{
//             mb: 3,
//             p: 2,
//             border: "1px solid",
//             borderColor: "divider",
//             borderRadius: 2,
//             bgcolor: "background.default",
//           }}
//         >
//           <Typography
//             variant="subtitle1"
//             fontWeight="bold"
//             sx={{ mb: 1 }}
//           >
//             Lista de vencimientos
//           </Typography>

//           <Box
//             sx={{
//               display: "flex",
//               gap: 1,
//               alignItems: "center",
//               flexWrap: "wrap",
//             }}
//           >
//             <FormControl
//               fullWidth
//               sx={{ flex: 1, minWidth: 220 }}
//             >
//               <InputLabel>Lista</InputLabel>

//               <Select
//                 value={selectedExpirationList}
//                 label="Lista"
//                 onChange={(e) =>
//                   handleExpirationListChange(e.target.value)
//                 }
//               >
//                 {expirationLists.map((list) => (
//                   <MenuItem
//                     key={list._id}
//                     value={list._id}
//                   >
//                     {list.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             <Button
//               variant="outlined"
//               onClick={() => setShowListModal(true)}
//             >
//               Nueva lista
//             </Button>
//           </Box>

//           {expirationLists.length === 0 && (
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{ mt: 1 }}
//             >
//               No hay listas para esta sucursal. Creá una para
//               comenzar.
//             </Typography>
//           )}

//           {selectedExpirationList && (
//             <Typography
//               variant="body2"
//               color="success.main"
//               sx={{ mt: 1 }}
//             >
//               Lista activa:{" "}
//               <strong>
//                 {
//                   expirationLists.find(
//                     (list) =>
//                       list._id === selectedExpirationList
//                   )?.name
//                 }
//               </strong>
//             </Typography>
//           )}
//         </Box>

//         {/* ====================================================
//             DATOS OBTENIDOS DEL QR
//         ==================================================== */}

//         {productInfo?.gtin && (
//           <Box
//             sx={{
//               border: "1px solid #ccc",
//               borderRadius: 2,
//               p: 2,
//               mb: 2,
//               backgroundColor: "#f5f5f5",
//             }}
//           >
//             <Typography
//               variant="subtitle1"
//               gutterBottom
//             >
//               Datos obtenidos del QR:
//             </Typography>

//             <Grid container spacing={1}>
//               <Grid item xs={12} sm={6}>
//                 <Typography>
//                   <strong>GTIN:</strong>{" "}
//                   {productInfo.gtin}
//                 </Typography>
//               </Grid>

//               {productInfo.expirationDate && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography>
//                     <strong>Vencimiento:</strong>{" "}
//                     {new Date(
//                       productInfo.expirationDate
//                     ).toLocaleDateString()}
//                   </Typography>
//                 </Grid>
//               )}

//               {productInfo.batchNumber && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography>
//                     <strong>Lote:</strong>{" "}
//                     {productInfo.batchNumber}
//                   </Typography>
//                 </Grid>
//               )}

//               {productInfo.serialNumber && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography>
//                     <strong>N° de Serie:</strong>{" "}
//                     {productInfo.serialNumber}
//                   </Typography>
//                 </Grid>
//               )}

//               {productInfo.customCode && (
//                 <Grid item xs={12} sm={6}>
//                   <Typography>
//                     <strong>Código personalizado:</strong>{" "}
//                     {productInfo.customCode}
//                   </Typography>
//                 </Grid>
//               )}
//             </Grid>
//           </Box>
//         )}

//         {/* ====================================================
//             BÚSQUEDA
//         ==================================================== */}

//         <BarcodeSearchSection
//           barcode={barcode}
//           setBarcode={setBarcode}
//           nameQuery={nameQuery}
//           setNameQuery={setNameQuery}
//           nameResults={nameResults}
//           setProductExists={setProductExists}
//           setProductInfo={setProductInfo}
//           handleSearch={handleSearch}
//           handleDetected={handleDetected}
//           scanning={scanning}
//           setScanning={setScanning}
//           barcodeInputRef={barcodeInputRef}
//           isAddMode={false}
//         />

//         {productExists && (
//           <Box sx={{ mb: 2 }}>
//             <Typography>
//               Producto encontrado:{" "}
//               <strong>{productInfo.name}</strong>{" "}
//               ({productInfo.type})
//             </Typography>
//           </Box>
//         )}

//         {/* ====================================================
//             FORMULARIO DE LOTE
//         ==================================================== */}

//         {productExists === true && (
//           <LotForm
//             productInfo={productInfo}
//             setProductInfo={setProductInfo}
//             productExists={productExists}
//             quantity={quantity}
//             setQuantity={setQuantity}
//             expMonth={expMonth}
//             setExpMonth={setExpMonth}
//             expYear={expYear}
//             setExpYear={setExpYear}
//             branch={branch}
//             setBranch={setBranch}
//             overstock={overstock}
//             setOverstock={setOverstock}
//             onSubmit={submit}
//             setBarcode={setBarcode}
//             setNameQuery={setNameQuery}
//             setNameResults={setNameResults}
//             barcodeInputRef={barcodeInputRef}
//             setProductExists={setProductExists}
//           />
//         )}

//         {/* ====================================================
//             MODAL CREAR PRODUCTO
//         ==================================================== */}

//         <Dialog
//           open={showCreateModal}
//           onClose={() => setShowCreateModal(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>
//             Crear nuevo producto
//           </DialogTitle>

//           <DialogContent>
//             <TextField
//               label="Código de barra"
//               value={barcode}
//               disabled
//               fullWidth
//               margin="dense"
//               InputProps={{ readOnly: true }}
//             />

//             <TextField
//               label="Nombre"
//               value={productInfo.name}
//               onChange={(e) =>
//                 setProductInfo((prev) => ({
//                   ...prev,
//                   name: e.target.value,
//                 }))
//               }
//               fullWidth
//               margin="dense"
//               autoFocus
//             />

//             <FormControl
//               fullWidth
//               margin="dense"
//             >
//               <InputLabel>Tipo</InputLabel>

//               <Select
//                 value={productInfo.type}
//                 onChange={(e) =>
//                   setProductInfo((prev) => ({
//                     ...prev,
//                     type: e.target.value,
//                   }))
//                 }
//                 label="Tipo"
//               >
//                 <MenuItem value="medicamento">
//                   Medicamento
//                 </MenuItem>

//                 <MenuItem value="perfumeria">
//                   Perfumería
//                 </MenuItem>
//               </Select>
//             </FormControl>

//             <Box
//               mt={2}
//               display="flex"
//               justifyContent="flex-end"
//               gap={1}
//             >
//               <Button
//                 onClick={() =>
//                   setShowCreateModal(false)
//                 }
//               >
//                 Cancelar
//               </Button>

//               <Button
//                 variant="contained"
//                 onClick={crearProducto}
//               >
//                 Crear producto
//               </Button>
//             </Box>
//           </DialogContent>
//         </Dialog>

//         {/* ====================================================
//             MODAL NUEVA LISTA
//         ==================================================== */}

//         <Dialog
//           open={showListModal}
//           onClose={() => setShowListModal(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>
//             Nueva lista de vencimientos
//           </DialogTitle>

//           <DialogContent>
//             <TextField
//               label="Nombre de la lista"
//               placeholder="Ej: Medicamentos"
//               value={newListName}
//               onChange={(e) =>
//                 setNewListName(e.target.value)
//               }
//               fullWidth
//               margin="dense"
//               autoFocus
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   crearLista();
//                 }
//               }}
//             />

//             <Box
//               mt={2}
//               display="flex"
//               justifyContent="flex-end"
//               gap={1}
//             >
//               <Button
//                 onClick={() => {
//                   setShowListModal(false);
//                   setNewListName("");
//                 }}
//               >
//                 Cancelar
//               </Button>

//               <Button
//                 variant="contained"
//                 onClick={crearLista}
//               >
//                 Crear lista
//               </Button>
//             </Box>
//           </DialogContent>
//         </Dialog>

//         {/* ====================================================
//             MODAL DUPLICADO
//         ==================================================== */}

//         <Dialog
//           open={showDuplicateModal}
//           onClose={() =>
//             setShowDuplicateModal(false)
//           }
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>
//             ⚠️ Vencimiento ya existente
//           </DialogTitle>

//           <DialogContent>
//             {duplicateLot && (
//               <>
//                 <Typography sx={{ mb: 2 }}>
//                   Ya existe un vencimiento para:
//                 </Typography>

//                 <Typography>
//                   <strong>Producto:</strong>{" "}
//                   {duplicateLot.productName}
//                 </Typography>

//                 <Typography>
//                   <strong>Cantidad existente:</strong>{" "}
//                   {duplicateLot.quantity}
//                 </Typography>

//                 <Typography>
//                   <strong>Cantidad que estás agregando:</strong>{" "}
//                   {duplicateLot.requestedQuantity}
//                 </Typography>

//                 <Typography sx={{ mt: 2 }}>
//                   ¿Qué querés hacer?
//                 </Typography>

//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     gap: 1,
//                     mt: 3,
//                   }}
//                 >
//                   <Button
//                     variant="outlined"
//                     onClick={() => {
//                       setShowDuplicateModal(false);
//                       setDuplicateLot(null);
//                     }}
//                   >
//                     Cancelar
//                   </Button>

//                   <Button
//                     variant="contained"
//                     disabled
//                   >
//                     Sumar cantidad
//                   </Button>
//                 </Box>

//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                   sx={{
//                     display: "block",
//                     mt: 1,
//                   }}
//                 >
//                   La opción de sumar se habilitará al
//                   conectar la actualización de cantidad.
//                 </Typography>
//               </>
//             )}
//           </DialogContent>
//         </Dialog>

//         {/* ====================================================
//             TABLA DE LOTES CREADOS
//         ==================================================== */}

//         {createdLots.length > 0 && (
//           <CreatedLotsTable
//             createdLots={createdLots}
//             onClear={clearLots}
//             onUpdate={setCreatedLots}
//           />
//         )}
//       </Box>

//       <AppSnackbar
//         snackbar={snackbar}
//         onClose={closeSnackbar}
//       />
//     </Box>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Grid,
  DialogTitle,
  Dialog,
  DialogContent,
} from "@mui/material";
import SucursalSelector from "./SucursalSelector.jsx";
import LotForm from "../lots/formularios/LotForm.jsx";
import CreatedLotsTable from "../lots/CreatedLotsTable.jsx";
import BarcodeSearchSection from "../lots/BarcodeSearchSection.jsx";
import useSnackbar from "../../hooks/useSnackbar.js";
import AppSnackbar from "../shared/AppSnackbar.jsx";
import { parseGS1Barcode } from "../../../utils/BarcodeParser.js";

export default function ProductForm() {
  const [barcode, setBarcode] = useState("");
  const [productExists, setProductExists] = useState(null);

  const [productInfo, setProductInfo] = useState({
    name: "",
    type: "medicamento",
    id: "",
  });

  const [quantity, setQuantity] = useState(1);

  const [expMonth, setExpMonth] = useState(() => {
    return localStorage.getItem("ultimo_mes_vencimiento") || "";
  });

  const [expYear, setExpYear] = useState(() => {
    return localStorage.getItem("ultimo_anio_vencimiento") || "";
  });

  const [scanning, setScanning] = useState(false);

  const [branch, setBranch] = useState(() => {
    return localStorage.getItem("selectedBranch") || "sucursal1";
  });

  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [overstock, setOverstock] = useState(false);

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // ============================================================
  // LOTES DE LA LISTA SELECCIONADA
  // ============================================================

  const [createdLots, setCreatedLots] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const barcodeInputRef = useRef(null);

  // ============================================================
  // LISTAS DE VENCIMIENTOS
  // ============================================================

  const [expirationLists, setExpirationLists] = useState([]);

  const [selectedExpirationList, setSelectedExpirationList] =
    useState(() => {
      return (
        localStorage.getItem("selectedExpirationList") || ""
      );
    });

  const [newListName, setNewListName] = useState("");
  const [showListModal, setShowListModal] = useState(false);

  // ============================================================
  // DUPLICADO
  // ============================================================

  const [duplicateLot, setDuplicateLot] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] =
    useState(false);

  // ============================================================
  // ESTADO DE CARGA DE LOTES
  // ============================================================

  const [loadingLots, setLoadingLots] = useState(false);

  // ============================================================
  // RECORDAR MES Y AÑO
  // ============================================================

  useEffect(() => {
    if (expMonth) {
      localStorage.setItem(
        "ultimo_mes_vencimiento",
        expMonth
      );
    }
  }, [expMonth]);

  useEffect(() => {
    if (expYear) {
      localStorage.setItem(
        "ultimo_anio_vencimiento",
        expYear
      );
    }
  }, [expYear]);

  // ============================================================
  // OBTENER LISTAS DE LA SUCURSAL
  // ============================================================

  useEffect(() => {
    if (!branch) return;

    const cargarListas = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/expiration-lists/branch/${branch}`
        );

        const lists = res.data.lists || [];

        setExpirationLists(lists);

        const savedListId = localStorage.getItem(
          "selectedExpirationList"
        );

        const savedListExists = lists.some(
          (list) => list._id === savedListId
        );

        if (savedListExists) {
          setSelectedExpirationList(savedListId);
        } else {
          localStorage.removeItem(
            "selectedExpirationList"
          );
          setSelectedExpirationList("");
          setCreatedLots([]);
        }
      } catch (err) {
        console.error(
          "Error obteniendo listas de vencimientos:",
          err
        );

        setExpirationLists([]);
        setSelectedExpirationList("");
        setCreatedLots([]);
      }
    };

    cargarListas();
  }, [branch]);

  // ============================================================
  // CARGAR LOTES DE LA LISTA SELECCIONADA
  // ============================================================

  useEffect(() => {
    if (!selectedExpirationList) {
      setCreatedLots([]);
      return;
    }

    const cargarLotesDeLista = async () => {
      try {
        setLoadingLots(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/expiration-lists/${selectedExpirationList}`
        );

        const lots = res.data.lots || [];

        setCreatedLots(lots);
      } catch (err) {
        console.error(
          "Error obteniendo lotes de la lista:",
          err
        );

        setCreatedLots([]);

        showSnackbar(
          "No se pudieron cargar los productos de la lista",
          "error"
        );
      } finally {
        setLoadingLots(false);
      }
    };

    cargarLotesDeLista();
  }, [selectedExpirationList]);

  // ============================================================
  // CAMBIAR LISTA
  // ============================================================

  const handleExpirationListChange = (value) => {
    setSelectedExpirationList(value);

    if (value) {
      localStorage.setItem(
        "selectedExpirationList",
        value
      );
    } else {
      localStorage.removeItem(
        "selectedExpirationList"
      );
    }
  };

  // ============================================================
  // CREAR NUEVA LISTA
  // ============================================================

  const crearLista = async () => {
    const nombre = newListName.trim();

    if (!nombre) {
      showSnackbar(
        "Ingresá un nombre para la lista",
        "warning"
      );
      return;
    }

    if (!branch) {
      showSnackbar(
        "Primero seleccioná una sucursal",
        "warning"
      );
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/expiration-lists`,
        {
          name: nombre,
          branch,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      const nuevaLista = res.data.list;

      setExpirationLists((prev) => [
        nuevaLista,
        ...prev,
      ]);

      setSelectedExpirationList(nuevaLista._id);

      localStorage.setItem(
        "selectedExpirationList",
        nuevaLista._id
      );

      setCreatedLots([]);

      setNewListName("");
      setShowListModal(false);

      showSnackbar(
        "Lista creada correctamente",
        "success"
      );
    } catch (err) {
      console.error("Error creando lista:", err);

      showSnackbar(
        err.response?.data?.message ||
          "Error al crear la lista",
        "error"
      );
    }
  };

  // ============================================================
  // BUSCAR PRODUCTOS POR NOMBRE
  // ============================================================

  useEffect(() => {
    if (nameQuery.length < 2) {
      setNameResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/search?name=${nameQuery}`
        );

        setNameResults(res.data);
      } catch (err) {
        console.error(
          "Error buscando por nombre:",
          err
        );
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [nameQuery]);

  // ============================================================
  // BUSCAR PRODUCTO POR CÓDIGO
  // ============================================================

  const handleSearch = async (code) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${code}`
      );

      setProductExists(true);

      setProductInfo((prev) => ({
        ...prev,
        id: res.data._id,
        name: res.data.name,
        type: res.data.type,
      }));
    } catch (err) {
      setProductExists(false);

      setProductInfo({
        name: "",
        type: "medicamento",
        id: "",
      });

      setShowCreateModal(true);
    }
  };

  // ============================================================
  // CÓDIGO DETECTADO POR SCANNER
  // ============================================================

  const handleDetected = (code) => {
    setScanning(false);

    if (code.length > 20) {
      const parsed = parseGS1Barcode(code);

      console.log(
        "🧾 Código QR parseado:",
        parsed
      );

      let gtin = parsed.gtin;

      if (
        gtin?.length === 14 &&
        /^[01]/.test(gtin)
      ) {
        gtin = gtin.slice(1);
      }

      if (gtin) {
        setBarcode(gtin);
        handleSearch(gtin);
      } else {
        setBarcode(code);
        handleSearch(code);
      }

      if (
        parsed.expirationDate instanceof Date &&
        !isNaN(parsed.expirationDate)
      ) {
        const date = parsed.expirationDate;

        setExpMonth(
          String(date.getMonth() + 1).padStart(
            2,
            "0"
          )
        );

        setExpYear(
          String(date.getFullYear())
        );
      }

      setProductInfo((prev) => ({
        ...prev,
        expirationDate:
          parsed.expirationDate,
        batchNumber:
          parsed.batchNumber,
        serialNumber:
          parsed.serialNumber,
        gtin,
      }));
    } else {
      setBarcode(code);
      handleSearch(code);
    }
  };

  // ============================================================
  // CREAR LOTE
  // ============================================================

  const submit = async () => {
    try {
      if (!selectedExpirationList) {
        showSnackbar(
          "Primero seleccioná una lista de vencimientos",
          "warning"
        );

        return;
      }

      let pid = productInfo.id;

      // --------------------------------------------------------
      // CREAR PRODUCTO SI NO EXISTE
      // --------------------------------------------------------

      if (!productExists) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            name: productInfo.name,
            barcode,
            type: productInfo.type,
          }
        );

        pid = res.data.product._id;

        setProductExists(true);
      }

      // --------------------------------------------------------
      // FECHA DE VENCIMIENTO
      // --------------------------------------------------------

      const expirationDate = new Date(
        `${expYear}-${expMonth}-01`
      ).toISOString();

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const lotePayload = {
        productId: pid,
        expirationDate,
        quantity: Number(quantity),
        branch,
        overstock,
        batchNumber:
          productInfo.batchNumber,
        serialNumber:
          productInfo.serialNumber,
        expirationListId:
          selectedExpirationList,
      };

      // --------------------------------------------------------
      // CREAR LOTE
      // --------------------------------------------------------

      const loteRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/lots`,
        lotePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      console.log(
        "Lote creado:",
        loteRes.data
      );

      const lote = loteRes.data.lot;

      // --------------------------------------------------------
      // ASEGURAR FORMATO PARA LA TABLA
      // --------------------------------------------------------

      if (!lote.productId) {
        lote.productId = {
          name: productInfo.name,
          barcode,
          type: productInfo.type,
        };
      }

      // Compatibilidad con CreatedLotsTable
      lote.product = {
        name: productInfo.name,
        barcode,
        type: productInfo.type,
      };

      // --------------------------------------------------------
      // AGREGAR AL PRINCIPIO DE LA LISTA
      // --------------------------------------------------------

      setCreatedLots((prev) => [
        lote,
        ...prev,
      ]);

      showSnackbar(
        "Vencimiento agregado correctamente",
        "success"
      );
    } catch (err) {
      console.error("Error:", err);

      // --------------------------------------------------------
      // LOTE DUPLICADO
      // --------------------------------------------------------

      if (err.response?.status === 409) {
        const loteDuplicado =
          err.response.data?.lot;

        setDuplicateLot({
          ...loteDuplicado,
          requestedQuantity:
            Number(quantity),
          productName:
            productInfo.name,
          expirationDate: new Date(
            `${expYear}-${expMonth}-01`
          ),
        });

        setShowDuplicateModal(true);

        return;
      }

      showSnackbar(
        err.response?.data?.message ||
          "Error al crear lote",
        "error"
      );
    }
  };

  // ============================================================
  // CREAR PRODUCTO NUEVO
  // ============================================================

  const crearProducto = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/products`,
        {
          name: productInfo.name,
          barcode,
          type: productInfo.type,
        }
      );

      setProductInfo((prev) => ({
        ...prev,
        id: res.data.product._id,
      }));

      setProductExists(true);
      setShowCreateModal(false);

      showSnackbar(
        "Producto creado correctamente!",
        "success"
      );
    } catch (err) {
      console.error(
        "Error creando producto:",
        err
      );

      showSnackbar(
        "Error al crear producto",
        "error"
      );
    }
  };

  // ============================================================
  // CAMBIAR SUCURSAL
  // ============================================================

  const handleBranchChange = (value) => {
    setBranch(value);

    localStorage.setItem(
      "selectedBranch",
      value
    );

    setSelectedExpirationList("");

    localStorage.removeItem(
      "selectedExpirationList"
    );

    setExpirationLists([]);
    setCreatedLots([]);
  };

  // ============================================================
  // LIMPIAR LOTES DE LA VISTA
  // ============================================================

  const clearLots = () => {
    setCreatedLots([]);
  };

  return (
    <Box
      sx={{
        width: "100%",
        pt: 2,
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <SucursalSelector
        branch={branch}
        onBranchChange={
          handleBranchChange
        }
      />

      <Box
        sx={{
          width: "100%",
          maxWidth: {
            xs: 700,
            sm: 900,
            md: 1000,
          },
          mx: "auto",
          minHeight: "100vh",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Agregar vencimientos
        </Typography>

        {/* ====================================================
            LISTA DE VENCIMIENTOS
        ==================================================== */}

        <Box
          sx={{
            mb: 3,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.default",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Lista de vencimientos
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControl
              fullWidth
              sx={{
                flex: 1,
                minWidth: 220,
              }}
            >
              <InputLabel>
                Lista
              </InputLabel>

              <Select
                value={
                  selectedExpirationList
                }
                label="Lista"
                onChange={(e) =>
                  handleExpirationListChange(
                    e.target.value
                  )
                }
              >
                {expirationLists.map(
                  (list) => (
                    <MenuItem
                      key={list._id}
                      value={list._id}
                    >
                      {list.name}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() =>
                setShowListModal(true)
              }
            >
              Nueva lista
            </Button>
          </Box>

          {expirationLists.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              No hay listas para esta
              sucursal. Creá una para
              comenzar.
            </Typography>
          )}

          {selectedExpirationList && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ mt: 1 }}
            >
              Lista activa:{" "}
              <strong>
                {
                  expirationLists.find(
                    (list) =>
                      list._id ===
                      selectedExpirationList
                  )?.name
                }
              </strong>
            </Typography>
          )}

          {loadingLots && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Cargando productos de la
              lista...
            </Typography>
          )}
        </Box>

        {/* ====================================================
            DATOS OBTENIDOS DEL QR
        ==================================================== */}

        {productInfo?.gtin && (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
            >
              Datos obtenidos del QR:
            </Typography>

            <Grid
              container
              spacing={1}
            >
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Typography>
                  <strong>
                    GTIN:
                  </strong>{" "}
                  {productInfo.gtin}
                </Typography>
              </Grid>

              {productInfo.expirationDate && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography>
                    <strong>
                      Vencimiento:
                    </strong>{" "}
                    {new Date(
                      productInfo.expirationDate
                    ).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}

              {productInfo.batchNumber && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography>
                    <strong>
                      Lote:
                    </strong>{" "}
                    {
                      productInfo.batchNumber
                    }
                  </Typography>
                </Grid>
              )}

              {productInfo.serialNumber && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography>
                    <strong>
                      N° de Serie:
                    </strong>{" "}
                    {
                      productInfo.serialNumber
                    }
                  </Typography>
                </Grid>
              )}

              {productInfo.customCode && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography>
                    <strong>
                      Código personalizado:
                    </strong>{" "}
                    {
                      productInfo.customCode
                    }
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* ====================================================
            BÚSQUEDA
        ==================================================== */}

        <BarcodeSearchSection
          barcode={barcode}
          setBarcode={setBarcode}
          nameQuery={nameQuery}
          setNameQuery={setNameQuery}
          nameResults={nameResults}
          setProductExists={
            setProductExists
          }
          setProductInfo={
            setProductInfo
          }
          handleSearch={
            handleSearch
          }
          handleDetected={
            handleDetected
          }
          scanning={scanning}
          setScanning={setScanning}
          barcodeInputRef={
            barcodeInputRef
          }
          isAddMode={false}
        />

        {productExists && (
          <Box sx={{ mb: 2 }}>
            <Typography>
              Producto encontrado:{" "}
              <strong>
                {productInfo.name}
              </strong>{" "}
              ({productInfo.type})
            </Typography>
          </Box>
        )}

        {/* ====================================================
            FORMULARIO DE LOTE
        ==================================================== */}

        {productExists === true && (
          <LotForm
            productInfo={
              productInfo
            }
            setProductInfo={
              setProductInfo
            }
            productExists={
              productExists
            }
            quantity={quantity}
            setQuantity={
              setQuantity
            }
            expMonth={
              expMonth
            }
            setExpMonth={
              setExpMonth
            }
            expYear={
              expYear
            }
            setExpYear={
              setExpYear
            }
            branch={branch}
            setBranch={setBranch}
            overstock={
              overstock
            }
            setOverstock={
              setOverstock
            }
            onSubmit={submit}
            setBarcode={
              setBarcode
            }
            setNameQuery={
              setNameQuery
            }
            setNameResults={
              setNameResults
            }
            barcodeInputRef={
              barcodeInputRef
            }
            setProductExists={
              setProductExists
            }
          />
        )}

        {/* ====================================================
            MODAL CREAR PRODUCTO
        ==================================================== */}

        <Dialog
          open={
            showCreateModal
          }
          onClose={() =>
            setShowCreateModal(false)
          }
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Crear nuevo producto
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Código de barra"
              value={barcode}
              disabled
              fullWidth
              margin="dense"
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              label="Nombre"
              value={
                productInfo.name
              }
              onChange={(e) =>
                setProductInfo(
                  (prev) => ({
                    ...prev,
                    name: e.target.value,
                  })
                )
              }
              fullWidth
              margin="dense"
              autoFocus
            />

            <FormControl
              fullWidth
              margin="dense"
            >
              <InputLabel>
                Tipo
              </InputLabel>

              <Select
                value={
                  productInfo.type
                }
                onChange={(e) =>
                  setProductInfo(
                    (prev) => ({
                      ...prev,
                      type: e.target.value,
                    })
                  )
                }
                label="Tipo"
              >
                <MenuItem value="medicamento">
                  Medicamento
                </MenuItem>

                <MenuItem value="perfumeria">
                  Perfumería
                </MenuItem>
              </Select>
            </FormControl>

            <Box
              mt={2}
              display="flex"
              justifyContent="flex-end"
              gap={1}
            >
              <Button
                onClick={() => {
                  setShowCreateModal(
                    false
                  );
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={
                  crearProducto
                }
              >
                Crear producto
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* ====================================================
            MODAL NUEVA LISTA
        ==================================================== */}

        <Dialog
          open={showListModal}
          onClose={() =>
            setShowListModal(false)
          }
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Nueva lista de vencimientos
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Nombre de la lista"
              placeholder="Ej: Medicamentos"
              value={
                newListName
              }
              onChange={(e) =>
                setNewListName(
                  e.target.value
                )
              }
              fullWidth
              margin="dense"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  crearLista();
                }
              }}
            />

            <Box
              mt={2}
              display="flex"
              justifyContent="flex-end"
              gap={1}
            >
              <Button
                onClick={() => {
                  setShowListModal(
                    false
                  );
                  setNewListName(
                    ""
                  );
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={
                  crearLista
                }
              >
                Crear lista
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* ====================================================
            MODAL DUPLICADO
        ==================================================== */}

        <Dialog
          open={
            showDuplicateModal
          }
          onClose={() =>
            setShowDuplicateModal(
              false
            )
          }
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            ⚠️ Vencimiento ya existente
          </DialogTitle>

          <DialogContent>
            {duplicateLot && (
              <>
                <Typography
                  sx={{ mb: 2 }}
                >
                  Ya existe un
                  vencimiento para:
                </Typography>

                <Typography>
                  <strong>
                    Producto:
                  </strong>{" "}
                  {
                    duplicateLot.productName
                  }
                </Typography>

                <Typography>
                  <strong>
                    Cantidad existente:
                  </strong>{" "}
                  {
                    duplicateLot.quantity
                  }
                </Typography>

                <Typography>
                  <strong>
                    Cantidad que estás
                    agregando:
                  </strong>{" "}
                  {
                    duplicateLot.requestedQuantity
                  }
                </Typography>

                <Typography
                  sx={{ mt: 2 }}
                >
                  ¿Qué querés hacer?
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 1,
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowDuplicateModal(
                        false
                      );
                      setDuplicateLot(
                        null
                      );
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    disabled
                  >
                    Sumar cantidad
                  </Button>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display:
                      "block",
                    mt: 1,
                  }}
                >
                  La opción de
                  sumar se
                  habilitará al
                  conectar la
                  actualización
                  de cantidad.
                </Typography>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ====================================================
            TABLA DE LOTES
        ==================================================== */}

        {selectedExpirationList &&
          createdLots.length === 0 &&
          !loadingLots && (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography>
                Esta lista todavía
                no tiene
                vencimientos.
              </Typography>
            </Box>
          )}

        {createdLots.length > 0 && (
          <CreatedLotsTable
            createdLots={
              createdLots
            }
            onClear={
              clearLots
            }
            onUpdate={
              setCreatedLots
            }
            expirationLists={expirationLists}
          />
        )}
      </Box>

      <AppSnackbar
        snackbar={snackbar}
        onClose={
          closeSnackbar
        }
      />
    </Box>
  );
}