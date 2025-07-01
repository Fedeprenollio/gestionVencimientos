// // src/pages/lists/AnalyzePriceChanges.jsx

// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { exportToTXT } from "../../../utils/exportUtils";
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
// } from "@mui/material";
// import { getListById } from "../../api/productApi";
// import dayjs from "dayjs";

// export default function AnalyzePriceChanges() {
//   const { listId } = useParams();
//   const [from, setFrom] = useState(dayjs().subtract(7, "day"));
//   const [to, setTo] = useState(dayjs());

//  const {
//     data: compareData,
//     isFetching,
//     refetch,
//     error: compareError,
//   } = useQuery({
//     queryKey: ["comparePrices", listId, from, to],
//     queryFn: async () => {
//       const res = await api.get(`/product-lists/${listId}/compare-prices`, {
//         params: {
//           from: from.format("YYYY-MM-DD"),
//           to: to.format("YYYY-MM-DD"),
//         },
//       });
//       return res.data;
//     },
//     enabled: false,
//   });

//   const {
//     data: listData,
//     isLoading: loadingList,
//     error: listError,
//   } = useQuery({
//     queryKey: ["list", listId],
//     queryFn: () => getListById(listId),
//   });
//   console.log("Renderizando AnalyzePriceChanges", error);

//   if (isLoading) return <CircularProgress />;
//   if (error)
//     return <Typography color="error">Error al cargar la lista</Typography>;

// //   const changed = [];
// //   const unchanged = [];

//   for (const product of list.products || []) {
//     const history = product.priceHistory || [];
//     if (history.length < 2) continue;

//     const last = history[history.length - 1]?.price;
//     const secondLast = history[history.length - 2]?.price;

//     if (last !== secondLast) {
//       changed.push({ ...product, last, secondLast });
//     } else {
//       unchanged.push({ ...product, last });
//     }
//   }

//   const changed = data?.products?.filter((p) => p.changed) || [];
//   const unchanged = data?.products?.filter((p) => !p.changed) || [];

//   const exportChangedCodes = () => {
//     const codes = changed.map((p) => p.barcode);
//     exportToTXT(codes, `cambios_precios_${list.name.replace(/\s+/g, "_")}.txt`);
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom>
//         Análisis de cambios de precios - {list.name}
//       </Typography>


      

//       <Box mt={2}>
//         <Typography variant="h6">Productos con cambio de precio:</Typography>
//         {changed.length === 0 ? (
//           <Typography>No hubo cambios recientes.</Typography>
//         ) : (
//           <>
//             <List dense>
//               {changed.map((p) => (
//                 <ListItem key={p._id}>
//                   <ListItemText
//                     primary={`${p.barcode} - ${p.name || "Producto"}`}
//                     secondary={`Precio anterior: ${p.secondLast} → Actual: ${p.last}`}
//                   />
//                 </ListItem>
//               ))}
//             </List>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={exportChangedCodes}
//             >
//               Exportar etiquetas de productos con cambio
//             </Button>
//           </>
//         )}
//       </Box>

//       <Divider sx={{ my: 3 }} />

//       <Box>
//         <Typography variant="h6">Productos sin cambio de precio:</Typography>
//         {unchanged.length === 0 ? (
//           <Typography>No hay productos sin cambios.</Typography>
//         ) : (
//           <List dense>
//             {unchanged.map((p) => (
//               <ListItem key={p._id}>
//                 <ListItemText
//                   primary={`${p.barcode} - ${p.name || "Producto"}`}
//                   secondary={`Precio actual: ${p.last}`}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         )}
//       </Box>
//     </Box>
//   );
// }

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Typography, CircularProgress, Button,
  List, ListItem, ListItemText, Divider
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { exportToTXT } from "../../../utils/exportUtils";
import { getListById } from "../../api/productApi";
import api from "../../api/axiosInstance";

export default function AnalyzePriceChanges() {
  const { listId } = useParams();
  const [from, setFrom] = useState(dayjs().subtract(7, "day"));
  const [to, setTo] = useState(dayjs());

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
      return res;
    },
    enabled: false,
  });

  const {
    data: listData,
    isLoading: loadingList,
    error: listError,
  } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListById(listId),
  });

  const handleCompare = () => refetch();
console.log("RESSSSS",compareData)
  const changed = compareData?.products?.filter((p) => p.changed) || [];
  const unchanged = compareData?.products?.filter((p) => !p.changed) || [];

  const exportChangedCodes = () => {
    const codes = changed.map((p) => p.barcode);
    exportToTXT(codes, `cambios_precios_${listData?.name?.replace(/\s+/g, "_")}.txt`);
  };

  if (loadingList) return <CircularProgress />;
  if (listError) return <Typography color="error">Error al cargar la lista</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Análisis de cambios de precios - {listData?.name}
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <DatePicker label="Desde" value={from} onChange={setFrom} />
        <DatePicker label="Hasta" value={to} onChange={setTo} />
        <Button variant="contained" onClick={handleCompare}>
          Comparar
        </Button>
      </Box>
{compareError && (
  <>
    <Typography color="error">Error al comparar precios</Typography>
    <pre style={{ color: "red" }}>{JSON.stringify(compareError, null, 2)}</pre>
  </>
)}

      {isFetching ? (
        <CircularProgress />
      ) : compareError ? (
        <Typography color="error">Error al comparar precios</Typography>
      ) : compareData ? (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Cambios: {changed.length} | Sin cambios: {unchanged.length}
          </Typography>

          <Typography variant="h6">Productos con cambio:</Typography>
          {changed.length === 0 ? (
            <Typography>No hubo cambios de precio.</Typography>
          ) : (
            <>
              <List dense>
                {changed.map((p) => (
                  <ListItem key={p._id}>
                    <ListItemText
                      primary={`${p.barcode} - ${p.name}`}
                      secondary={`De: ${p.fromPrice} → A: ${p.toPrice}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" color="success" onClick={exportChangedCodes}>
                Exportar etiquetas
              </Button>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Productos sin cambio:</Typography>
          {unchanged.length === 0 ? (
            <Typography>No hay productos sin cambios.</Typography>
          ) : (
            <List dense>
              {unchanged.map((p) => (
                <ListItem key={p._id}>
                  <ListItemText
                    primary={`${p.barcode} - ${p.name}`}
                    secondary={`Precio: ${p.toPrice}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      ) : null}
    </Box>
  );
}

