import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { exportToTXT } from "../../../utils/exportUtils";
import { getListById } from "../../api/productApi";
import api from "../../api/axiosInstance";
import PriceComparisonByDate from "./PriceComparisonByDate";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AnalyzePriceChanges() {
  const { listId } = useParams();

  // Inicializamos fechas en zona horaria Argentina
  const [from, setFrom] = useState(
    dayjs().tz("America/Argentina/Buenos_Aires").subtract(7, "day")
  );
  const [to, setTo] = useState(dayjs().tz("America/Argentina/Buenos_Aires"));

  const {
    data: compareData,
    isFetching,
    refetch,
    error: compareError,
  } = useQuery({
    queryKey: ["comparePrices", listId, from, to],
    queryFn: async () => {
      const res = await api.get(`/product-lists/${listId}/compare-prices`, {
        params: {
          from: from.format("YYYY-MM-DD"),
          to: to.format("YYYY-MM-DD"),
        },
      });
      return res; // Ojo que la respuesta está en res.data
    },
    enabled: false,
  });
console.log("compareData:",compareData)
  const {
    data: listData,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListById(listId),
  });

  const handleCompare = () => refetch();

  // Separamos por categoría:
  const increased =
    compareData?.products?.filter(
      (p) => p.changed && p.toPrice > p.fromPrice
    ) || [];
  const decreased =
    compareData?.products?.filter(
      (p) => p.changed && p.toPrice < p.fromPrice
    ) || [];
  const unchanged = compareData?.products?.filter((p) => !p.changed) || [];
  const firstPrice = compareData?.products?.filter((p) => p.firstPrice) || []; // Nueva categoría

  // Funciones para exportar códigos
  const exportCodes = (products, filename) => {
    const codes = products.map((p) => p.barcode);
    exportToTXT(codes, filename);
  };

  if (loadingList) return <CircularProgress />;
  if (listError)
    return <Typography color="error">Error al cargar la lista</Typography>;

  return (

   <>
   
   <PriceComparisonByDate listId={listId}/>
   </>
    // <Box p={3}>
    //   <Typography variant="h5" gutterBottom>
    //     Análisis de cambios de precios - {listData?.name}
    //   </Typography>

    //   <Box display="flex" gap={2} mb={2}>
    //     <DatePicker
    //       label="Desde"
    //       value={from}
    //       onChange={(newVal) =>
    //         newVal && setFrom(newVal.tz("America/Argentina/Buenos_Aires"))
    //       }
    //     />
    //     <DatePicker
    //       label="Hasta"
    //       value={to}
    //       onChange={(newVal) =>
    //         newVal && setTo(newVal.tz("America/Argentina/Buenos_Aires"))
    //       }
    //     />
    //     <Button variant="contained" onClick={handleCompare}>
    //       Comparar
    //     </Button>
    //   </Box>

    //   {compareError && (
    //     <>
    //       <Typography color="error">Error al comparar precios</Typography>
    //       <pre style={{ color: "red" }}>
    //         {JSON.stringify(compareError, null, 2)}
    //       </pre>
    //     </>
    //   )}

    //   {isFetching ? (
    //     <CircularProgress />
    //   ) : compareData ? (
    //     <>
    //       <Typography variant="subtitle1" gutterBottom>
    //         Aumentaron: {increased.length} | Bajaron: {decreased.length} | Sin
    //         cambios: {unchanged.length} | Primer precio: {firstPrice.length}
    //       </Typography>

        
    //       <Divider sx={{ my: 3 }} />
    //       {/* Primer precio */}
    //       <Typography variant="h6" color="info.main">
    //         Productos con primer precio:
    //       </Typography>
    //       {firstPrice.length === 0 ? (
    //         <Typography>No hay productos con primer precio.</Typography>
    //       ) : (
    //         <>
    //           <List dense>
    //             {firstPrice.map((p) => (
    //               <ListItem key={p._id}>
    //                 <ListItemText
    //                   primary={`${p.barcode} - ${p.name}`}
    //                   secondary={`Precio: $${p.toPrice || p.fromPrice}`}
    //                 />
    //               </ListItem>
    //             ))}
    //           </List>
    //           <Button
    //             variant="outlined"
    //             color="info"
    //             onClick={() =>
    //               exportCodes(
    //                 firstPrice,
    //                 `primer_precio_${listData?.name?.replace(/\s+/g, "_")}.txt`
    //               )
    //             }
    //           >
    //             Exportar primeros precios
    //           </Button>
    //         </>
    //       )}

    //       {/* Aumentos */}
    //       <Typography variant="h6" color="success.main">
    //         Productos que aumentaron:
    //       </Typography>
    //       {increased.length === 0 ? (
    //         <Typography>No hubo aumentos.</Typography>
    //       ) : (
    //         <>
    //           <List dense>
    //             {increased.map((p) => (
    //               <ListItem key={p._id}>
    //                 <ListItemText
    //                   primary={`${p.barcode} - ${p.name}`}
    //                   secondary={`De: $${p.fromPrice} → A: $${p.toPrice}`}
    //                 />
    //               </ListItem>
    //             ))}
    //           </List>
    //           <Button
    //             variant="outlined"
    //             onClick={() =>
    //               exportCodes(
    //                 increased,
    //                 `aumentos_${listData?.name?.replace(/\s+/g, "_")}.txt`
    //               )
    //             }
    //           >
    //             Exportar aumentos
    //           </Button>
    //         </>
    //       )}

    //       <Divider sx={{ my: 3 }} />

    //       {/* Bajas */}
    //       <Typography variant="h6" color="error.main">
    //         Productos que bajaron:
    //       </Typography>
    //       {decreased.length === 0 ? (
    //         <Typography>No hubo bajas de precio.</Typography>
    //       ) : (
    //         <>
    //           <List dense>
    //             {decreased.map((p) => (
    //               <ListItem key={p._id}>
    //                 <ListItemText
    //                   primary={`${p.barcode} - ${p.name}`}
    //                   secondary={`De: $${p.fromPrice} → A: $${p.toPrice}`}
    //                 />
    //               </ListItem>
    //             ))}
    //           </List>
    //           <Button
    //             variant="outlined"
    //             color="error"
    //             onClick={() =>
    //               exportCodes(
    //                 decreased,
    //                 `bajas_${listData?.name?.replace(/\s+/g, "_")}.txt`
    //               )
    //             }
    //           >
    //             Exportar bajas
    //           </Button>
    //         </>
    //       )}

    //       <Divider sx={{ my: 3 }} />

    //       {/* Sin cambios */}
    //       <Typography variant="h6">Productos sin cambios:</Typography>
    //       {unchanged.length === 0 ? (
    //         <Typography>No hubo productos sin cambios.</Typography>
    //       ) : (
    //         <List dense>
    //           {unchanged.map((p) => (
    //             <ListItem key={p._id}>
    //               <ListItemText
    //                 primary={`${p.barcode} - ${p.name}`}
    //                 secondary={`Precio estable: $${p.toPrice}`}
    //               />
    //             </ListItem>
    //           ))}
    //         </List>
    //       )}

    //       <Divider sx={{ my: 3 }} />

    //       <Button
    //         variant="contained"
    //         color="primary"
    //         onClick={() =>
    //           exportCodes(
    //             [...increased, ...decreased],
    //             `cambios_precios_${listData?.name?.replace(/\s+/g, "_")}.txt`
    //           )
    //         }
    //       >
    //         Exportar todos los códigos con cambios
    //       </Button>
    //     </>
    //   ) : null}
    // </Box>
  );
}
