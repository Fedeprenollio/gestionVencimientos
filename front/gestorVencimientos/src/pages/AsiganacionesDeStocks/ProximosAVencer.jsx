
// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Paper,
//   Tabs,
//   Tab,
// } from "@mui/material";

// export default function TrasladoProductos() {
//   const [groupedBySucursal, setGroupedBySucursal] = useState({});
//   const [groupedByOrigen, setGroupedByOrigen] = useState({});
//   const [tab, setTab] = useState(0);

//   const parseNumber = (val) => {
//     const n = Number(val);
//     return isNaN(n) ? 0 : n;
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const bstr = evt.target.result;
//       const wb = XLSX.read(bstr, { type: "binary" });
//       const wsname = wb.SheetNames[0];
//       const ws = wb.Sheets[wsname];
//       const jsonData = XLSX.utils.sheet_to_json(ws);
//       assignProducts(jsonData);
//     };
//     reader.readAsBinaryString(file);
//   };


  // const assignProducts = (rows) => {
  //   const productsMap = {};

  //   rows.forEach((r) => {
  //     const codigo = (r["Código de Barra"] ?? "").toString().trim();
  //     if (!codigo) return;

  //     const producto = r["Producto"] ?? "";
  //     const mes = (r["Mes"] ?? "").toString().trim();
  //     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN")
  //       .toString()
  //       .trim();
  //     const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN")
  //       .toString()
  //       .trim();

  //     const cantidad = parseNumber(r["Cantidad"]);
  //     const ventas = parseNumber(r["Unidades vendidas en destino"]);
  //     const stock = parseNumber(r["Stock"]);

  //     const prodKey = `${codigo}||${mes}`;
  //     if (!productsMap[prodKey]) {
  //       productsMap[prodKey] = {
  //         codigo,
  //         producto,
  //         mes,
  //         origins: {}, // como antes: origen -> cantidad (primer valor)
  //         destinations: {}, // como antes: destino -> { ventas, stock } (primer valor)
  //         ventasOrigin: {}, // NUEVO: acumulador de ventas cuando origen === destino
  //       };
  //     }

  //     const prod = productsMap[prodKey];

  //     if (sucursalOrigen === sucursalDestino) {
  //       // Esta fila indica ventas EN la misma sucursal (ventas en origen)
  //       prod.ventasOrigin[sucursalOrigen] =
  //         (prod.ventasOrigin[sucursalOrigen] || 0) + ventas;
  //       // No tocamos origins.cantidad ni destinations (conservamos comportamiento original)
  //     } else {
  //       // Comportamiento original: guardar cantidad del origen sólo si no existe aún
  //       if (!prod.origins[sucursalOrigen]) {
  //         prod.origins[sucursalOrigen] = cantidad;
  //       }
  //       // Comportamiento original: guardar ventas/stock del destino solo si no existe aún
  //       if (!prod.destinations[sucursalDestino]) {
  //         prod.destinations[sucursalDestino] = { ventas, stock };
  //       }
  //     }
  //   });

  //   const result = {};

  //   Object.values(productsMap).forEach((prod) => {
  //     const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
  //       sucursalOrigen: origen,
  //       cantidad: qty,
  //       ventasOrigen: prod.ventasOrigin[origen] || 0, // traemos las ventas en origen si existen
  //     }));

  //     const destinosArr = Object.entries(prod.destinations).map(
  //       ([dest, v]) => ({
  //         sucursalDestino: dest,
  //         ventas: v.ventas,
  //         stock: v.stock,
  //       })
  //     );

  //     const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
  //     if (destinosValidos.length === 0) return;

  //     destinosValidos.sort((a, b) => b.ventas - a.ventas);

  //     let idxDestino = 0;
  //     originsArr.forEach((origen) => {
  //       if (origen.cantidad <= 0) return;

  //       const destino = destinosValidos[idxDestino % destinosValidos.length];

  //       if (!result[destino.sucursalDestino])
  //         result[destino.sucursalDestino] = [];
  //       result[destino.sucursalDestino].push({
  //         codigo: prod.codigo,
  //         producto: prod.producto,
  //         sucursalOrigen: origen.sucursalOrigen,
  //         vence: prod.mes,
  //         cantidadTrasladar: origen.cantidad,
  //         ventasDestino: destino.ventas,
  //         stockDestino: destino.stock,
  //         ventasOrigen: origen.ventasOrigen, // lo pasamos para poder mostrar/exportar
  //       });

  //       idxDestino++;
  //     });
  //   });

  //   // Agrupado inverso (por origen)
  //   const origenesResult = {};
  //   Object.entries(result).forEach(([destino, items]) => {
  //     items.forEach((item) => {
  //       if (!origenesResult[item.sucursalOrigen])
  //         origenesResult[item.sucursalOrigen] = [];
  //       origenesResult[item.sucursalOrigen].push({
  //         ...item,
  //         sucursalDestino: destino,
  //       });
  //     });
  //   });

  //   setGroupedBySucursal(result);
  //   setGroupedByOrigen(origenesResult);
  // };

//  const exportToExcel = (data, isDestino) => {
//   const wb = XLSX.utils.book_new();

//   Object.keys(data).forEach((key) => {
//     const cleanSheetName = key.substring(0, 31); // Excel no admite nombres >31 caracteres

//     // 🔹 Agrego filas con títulos antes de los datos
//     const titulo = isDestino
//       ? [`Sucursal de Destino: ${key}`] // si el key representa la sucursal origen
//       : [`Sucursal de Origen: ${key}`];

//     const rows = data[key].map((item) => {
//       if (isDestino) {
//         return {
//           "Sucursal Origen": item.sucursalOrigen,
//           Código: item.codigo,
//           Producto: item.producto,
//           Vence: item.vence,
//           "Cantidad a trasladar": item.cantidadTrasladar,
//           "Ventas en origen": item.ventasOrigen,
//           "Ventas en destino": item.ventasDestino,
//           "Stock en destino": item.stockDestino,
//         };
//       } else {
//         return {
//           "Sucursal Destino (Ventas)": `${item.sucursalDestino} (${item.ventasDestino})`,
//           Código: item.codigo,
//           Producto: item.producto,
//           Vence: item.vence,
//           "Cantidad a preparar": item.cantidadTrasladar,
//           "Ventas en origen": item.ventasOrigen,
//           "Ventas en destino": item.ventasDestino,
//         };
//       }
//     });



//     // 🔹 Creamos una hoja nueva con el título en la primera fila
//     const ws = XLSX.utils.aoa_to_sheet([titulo]);
//     XLSX.utils.sheet_add_json(ws, rows, { origin: "A4" });

//     // 🔹 Agregamos hoja al workbook
//     XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
//   });

//   XLSX.writeFile(
//     wb,
//     isDestino ? "Distribucion_por_Destino.xlsx" : "Pedidos_por_Origen.xlsx"
//   );
// };

//   return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom>
//         Plan de Traslado de Productos Críticos
//       </Typography>

//       <Button variant="contained" component="label">
//         Cargar Excel
//         <input type="file" hidden onChange={handleFileUpload} />
//       </Button>

//       {Object.keys(groupedBySucursal).length > 0 && (
//         <>
//           <Tabs
//             value={tab}
//             onChange={(e, newValue) => setTab(newValue)}
//             sx={{ mt: 3 }}
//           >
//             <Tab label="Distribución por Destino" />
//             <Tab label="Pedidos por Origen" />
//           </Tabs>

//           {tab === 0 && (
//             <>
//               <Button
//                 variant="outlined"
//                 sx={{ mt: 2 }}
//                 onClick={() => exportToExcel(groupedBySucursal, true)}
//               >
//                 Exportar Excel (Distribución)
//               </Button>
//               {Object.keys(groupedBySucursal).map((suc) => (
//                 <Paper key={suc} sx={{ my: 3, p: 2 }}>
//                   <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Sucursal Origen</TableCell>
//                         <TableCell>Código</TableCell>
//                         <TableCell>Producto</TableCell>
//                         <TableCell>Vence</TableCell>
//                         <TableCell>Cantidad a trasladar</TableCell>
//                         <TableCell>Ventas en origen</TableCell> {/* 👈 NUEVO */}
//                         <TableCell>Ventas en destino</TableCell>
//                         <TableCell>Stock en destino</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {groupedBySucursal[suc].map((item, i) => (
//                         <TableRow key={i}>
//                           <TableCell>{item.sucursalOrigen}</TableCell>
//                           <TableCell>{item.codigo}</TableCell>
//                           <TableCell>{item.producto}</TableCell>
//                           <TableCell>{item.vence}</TableCell>
//                           <TableCell>{item.cantidadTrasladar}</TableCell>
//                           <TableCell>{item.ventasOrigen}</TableCell>{" "}
//                           {/* 👈 NUEVO */}
//                           <TableCell>{item.ventasDestino}</TableCell>
//                           <TableCell>{item.stockDestino}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//               ))}
//             </>
//           )}

//           {tab === 1 && (
//             <>
//               <Button
//                 variant="outlined"
//                 sx={{ mt: 2 }}
//                 onClick={() => exportToExcel(groupedByOrigen, false)}
//               >
//                 Exportar Excel (Pedidos)
//               </Button>
//               {Object.keys(groupedByOrigen).map((origen) => (
//                 <Paper key={origen} sx={{ my: 3, p: 2 }}>
//                   <Typography variant="h6">{`Sucursal origen: ${origen}`}</Typography>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Destino (Ventas)</TableCell>
//                         <TableCell>Código</TableCell>
//                         <TableCell>Producto</TableCell>
//                         <TableCell>Vence</TableCell>
//                         <TableCell>Cantidad a trasladas</TableCell>
//                         <TableCell>Ventas en origen</TableCell> {/* 👈 NUEVO */}
//                         <TableCell>Ventas en destino</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {groupedByOrigen[origen].map((item, i) => (
//                         <TableRow key={i}>
//                           <TableCell>
//                             {item.sucursalDestino} ({item.ventasDestino})
//                           </TableCell>
//                           <TableCell>{item.codigo}</TableCell>
//                           <TableCell>{item.producto}</TableCell>
//                           <TableCell>{item.vence}</TableCell>
//                           <TableCell>{item.cantidadTrasladar}</TableCell>
//                           <TableCell>{item.ventasOrigen}</TableCell>{" "}
//                           <TableCell>{item.ventasDestino}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//               ))}
//             </>
//           )}
//         </>
//       )}
//     </Box>
//   );
// }

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Paper,
//   Tabs,
//   Tab,
// } from "@mui/material";

// export default function TrasladoProductos() {
//   const [groupedBySucursal, setGroupedBySucursal] = useState({});
//   const [groupedByOrigen, setGroupedByOrigen] = useState({});
//   const [tab, setTab] = useState(0);

//   const parseNumber = (val) => {
//     const n = Number(val);
//     return isNaN(n) ? 0 : n;
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const bstr = evt.target.result;
//       const wb = XLSX.read(bstr, { type: "binary" });
//       const wsname = wb.SheetNames[0];
//       const ws = wb.Sheets[wsname];
//       const jsonData = XLSX.utils.sheet_to_json(ws);
//       assignProducts(jsonData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const assignProducts = (rows) => {
//     const productsMap = {}; // key: codigo||mes
//     const codeToOriginsSet = {}; // key: codigo -> Set(sucursales que envían ese codigo)
//     const codeToDestinationsSet = {}; // key: codigo -> Set(sucursales que reciben ese codigo)

//     rows.forEach((r) => {
//       const codigo = (r["Código de Barra"] ?? "").toString().trim();
//       if (!codigo) return;

//       const producto = r["Producto"] ?? "";
//       const mes = (r["Mes"] ?? "").toString().trim();
//       const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN")
//         .toString()
//         .trim();
//       const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN")
//         .toString()
//         .trim();

//       const cantidad = parseNumber(r["Cantidad"]);
//       const ventas = parseNumber(r["Unidades vendidas en destino"]);
//       const stock = parseNumber(r["Stock"]);

//       // Construir maps por codigo (sin mes) para la regla estricta
//       if (!codeToOriginsSet[codigo]) codeToOriginsSet[codigo] = new Set();
//       if (!codeToDestinationsSet[codigo])
//         codeToDestinationsSet[codigo] = new Set();

//       // Consideramos que una fila indica ORIGEN si tiene cantidad > 0
//       if (cantidad > 0) {
//         codeToOriginsSet[codigo].add(sucursalOrigen);
//       }
//       // Consideramos que una fila indica DESTINO si origin != dest (hay una fila de destino) y/o ventas/stock existe
//       if (sucursalDestino && sucursalDestino !== sucursalOrigen) {
//         // si aparece en columna destino, lo marco como destino para ese codigo
//         codeToDestinationsSet[codigo].add(sucursalDestino);
//       } else {
//         // Si origin === dest, normalmente son ventas en origen; no lo marcamos como "destino" en el mapa
//         // (la regla que nos pediste excluye sólo cuando hay envío/recepción entre sucursales)
//       }

//       const prodKey = `${codigo}||${mes}`;
//       if (!productsMap[prodKey]) {
//         productsMap[prodKey] = {
//           codigo,
//           producto,
//           mes,
//           origins: {}, // origen -> cantidad (primer valor)
//           destinations: {}, // destino -> { ventas, stock } (primer valor)
//           ventasOrigin: {}, // acumulador ventas cuando origen === destino
//         };
//       }

//       const prod = productsMap[prodKey];

//       if (sucursalOrigen === sucursalDestino) {
//         // ventas en la misma sucursal
//         prod.ventasOrigin[sucursalOrigen] =
//           (prod.ventasOrigin[sucursalOrigen] || 0) + ventas;
//       } else {
//         if (!prod.origins[sucursalOrigen]) {
//           prod.origins[sucursalOrigen] = cantidad;
//         }
//         if (!prod.destinations[sucursalDestino]) {
//           prod.destinations[sucursalDestino] = { ventas, stock };
//         }
//       }
//     });

//     const result = {};

//     // Ahora procesamos cada producto (codigo||mes), pero aplicando la regla estricta
//     Object.values(productsMap).forEach((prod) => {
//       const codigo = prod.codigo;

//       // Sets globales para este código (sin importar mes)
//       const globalOrigins = codeToOriginsSet[codigo] || new Set();
//       const globalDestinations = codeToDestinationsSet[codigo] || new Set();

//       // Construir arrays desde prod.origins / prod.destinations
//       let originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
//         sucursalOrigen: origen,
//         cantidad: qty,
//         ventasOrigen: prod.ventasOrigin[origen] || 0,
//       }));

//       // **Excluir como ORIGEN cualquier sucursal que figure como DESTINO global del mismo código**
//       originsArr = originsArr.filter(
//         (o) => !globalDestinations.has(o.sucursalOrigen)
//       );

//       const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
//         sucursalDestino: dest,
//         ventas: v.ventas,
//         stock: v.stock,
//       }));

//       // **Excluir como DESTINO cualquier sucursal que figure como ORIGEN global del mismo código**
//       const destinosValidos = destinosArr
//         .filter((d) => !globalOrigins.has(d.sucursalDestino)) // regla estricta
//         .filter((d) => d.ventas >= 5); // umbral de ventas

//       if (destinosValidos.length === 0) return;

//       destinosValidos.sort((a, b) => b.ventas - a.ventas);

//       let idxDestino = 0;
//       originsArr.forEach((origen) => {
//         if (origen.cantidad <= 0) return;

//         // Encontrar el siguiente destino válido que no sea la misma sucursal que el origen
//         // (además ya filtramos globalOrigins)
//         let destino = null;
//         // intentamos buscar entre la lista ordenada (round-robin respetando la regla)
//         for (let i = 0; i < destinosValidos.length; i++) {
//           const cand = destinosValidos[(idxDestino + i) % destinosValidos.length];
//           if (cand.sucursalDestino !== origen.sucursalOrigen) {
//             destino = cand;
//             // avanzamos idxDestino para la próxima asignación
//             idxDestino = (idxDestino + i + 1) % destinosValidos.length;
//             break;
//           }
//         }

//         // Si no hay destino compatible (por reglas), saltamos
//         if (!destino) return;

//         if (!result[destino.sucursalDestino])
//           result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: prod.codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stock,
//           ventasOrigen: origen.ventasOrigen,
//         });

//         // idxDestino++ ya fue manejado arriba para mantener round-robin aproximado
//       });
//     });

//     // Agrupado inverso (por origen)
//     const origenesResult = {};
//     Object.entries(result).forEach(([destino, items]) => {
//       items.forEach((item) => {
//         if (!origenesResult[item.sucursalOrigen])
//           origenesResult[item.sucursalOrigen] = [];
//         origenesResult[item.sucursalOrigen].push({
//           ...item,
//           sucursalDestino: destino,
//         });
//       });
//     });

//     setGroupedBySucursal(result);
//     setGroupedByOrigen(origenesResult);
//   };




//   const exportToExcel = (data, isDestino) => {
//     const wb = XLSX.utils.book_new();

//     Object.keys(data).forEach((key) => {
//       const cleanSheetName = key.substring(0, 31); // Excel no admite nombres >31 caracteres

//       const titulo = isDestino
//         ? [`Sucursal de Destino: ${key}`]
//         : [`Sucursal de Origen: ${key}`];

//       const rows = data[key].map((item) => {
//         if (isDestino) {
//           return {
//             "Sucursal Origen": item.sucursalOrigen,
//             Código: item.codigo,
//             Producto: item.producto,
//             Vence: item.vence,
//             "Cantidad a trasladar": item.cantidadTrasladar,
//             "Ventas en origen": item.ventasOrigen,
//             "Ventas en destino": item.ventasDestino,
//             "Stock en destino": item.stockDestino,
//           };
//         } else {
//           return {
//             "Sucursal Destino (Ventas)": `${item.sucursalDestino} (${item.ventasDestino})`,
//             Código: item.codigo,
//             Producto: item.producto,
//             Vence: item.vence,
//             "Cantidad a preparar": item.cantidadTrasladar,
//             "Ventas en origen": item.ventasOrigen,
//             "Ventas en destino": item.ventasDestino,
//           };
//         }
//       });

//       const ws = XLSX.utils.aoa_to_sheet([titulo]);
//       XLSX.utils.sheet_add_json(ws, rows, { origin: "A4" });

//       XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
//     });

//     XLSX.writeFile(
//       wb,
//       isDestino ? "Distribucion_por_Destino.xlsx" : "Pedidos_por_Origen.xlsx"
//     );
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom>
//         Plan de Traslado de Productos Críticos
//       </Typography>

//       <Button variant="contained" component="label">
//         Cargar Excel
//         <input type="file" hidden onChange={handleFileUpload} />
//       </Button>

//       {Object.keys(groupedBySucursal).length > 0 && (
//         <>
//           <Tabs
//             value={tab}
//             onChange={(e, newValue) => setTab(newValue)}
//             sx={{ mt: 3 }}
//           >
//             <Tab label="Distribución por Destino" />
//             <Tab label="Pedidos por Origen" />
//           </Tabs>

//           {tab === 0 && (
//             <>
//               <Button
//                 variant="outlined"
//                 sx={{ mt: 2 }}
//                 onClick={() => exportToExcel(groupedBySucursal, true)}
//               >
//                 Exportar Excel (Distribución)
//               </Button>
//               {Object.keys(groupedBySucursal).map((suc) => (
//                 <Paper key={suc} sx={{ my: 3, p: 2 }}>
//                   <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Sucursal Origen</TableCell>
//                         <TableCell>Código</TableCell>
//                         <TableCell>Producto</TableCell>
//                         <TableCell>Vence</TableCell>
//                         <TableCell>Cantidad a trasladar</TableCell>
//                         <TableCell>Ventas en origen</TableCell>
//                         <TableCell>Ventas en destino</TableCell>
//                         <TableCell>Stock en destino</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {groupedBySucursal[suc].map((item, i) => (
//                         <TableRow key={i}>
//                           <TableCell>{item.sucursalOrigen}</TableCell>
//                           <TableCell>{item.codigo}</TableCell>
//                           <TableCell>{item.producto}</TableCell>
//                           <TableCell>{item.vence}</TableCell>
//                           <TableCell>{item.cantidadTrasladar}</TableCell>
//                           <TableCell>{item.ventasOrigen}</TableCell>
//                           <TableCell>{item.ventasDestino}</TableCell>
//                           <TableCell>{item.stockDestino}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//               ))}
//             </>
//           )}

//           {tab === 1 && (
//             <>
//               <Button
//                 variant="outlined"
//                 sx={{ mt: 2 }}
//                 onClick={() => exportToExcel(groupedByOrigen, false)}
//               >
//                 Exportar Excel (Pedidos)
//               </Button>
//               {Object.keys(groupedByOrigen).map((origen) => (
//                 <Paper key={origen} sx={{ my: 3, p: 2 }}>
//                   <Typography variant="h6">{`Sucursal origen: ${origen}`}</Typography>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Destino (Ventas)</TableCell>
//                         <TableCell>Código</TableCell>
//                         <TableCell>Producto</TableCell>
//                         <TableCell>Vence</TableCell>
//                         <TableCell>Cantidad a trasladas</TableCell>
//                         <TableCell>Ventas en origen</TableCell>
//                         <TableCell>Ventas en destino</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {groupedByOrigen[origen].map((item, i) => (
//                         <TableRow key={i}>
//                           <TableCell>
//                             {item.sucursalDestino} ({item.ventasDestino})
//                           </TableCell>
//                           <TableCell>{item.codigo}</TableCell>
//                           <TableCell>{item.producto}</TableCell>
//                           <TableCell>{item.vence}</TableCell>
//                           <TableCell>{item.cantidadTrasladar}</TableCell>
//                           <TableCell>{item.ventasOrigen}</TableCell>
//                           <TableCell>{item.ventasDestino}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//               ))}
//             </>
//           )}
//         </>
//       )}
//     </Box>
//   );
// }


import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";

export default function TrasladoProductos() {
  const [groupedBySucursal, setGroupedBySucursal] = useState({});
  const [groupedByOrigen, setGroupedByOrigen] = useState({});
  const [tab, setTab] = useState(0);

  const parseNumber = (val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      assignProducts(jsonData);
    };
    reader.readAsBinaryString(file);
  };


// const assignProducts = (rows) => {
//   const productsMap = {};
//   const codeToOriginsSet = {};

//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stock = Number(r["Stock"]) || 0;

//     const prodKey = `${codigo}||${mes}`;
//     if (!productsMap[prodKey]) {
//       productsMap[prodKey] = {
//         codigo,
//         producto,
//         mes,
//         origins: {},
//         destinations: {},
//         ventasOrigin: {},
//       };
//     }

//     const prod = productsMap[prodKey];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigin[sucursalOrigen] =
//         (prod.ventasOrigin[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (!prod.origins[sucursalOrigen]) prod.origins[sucursalOrigen] = cantidad;
//       if (sucursalDestino && !prod.destinations[sucursalDestino]) {
//         prod.destinations[sucursalDestino] = { ventas, stock };
//       }
//     }

//     if (!codeToOriginsSet[prod.codigo]) codeToOriginsSet[prod.codigo] = new Set();
//     if (cantidad > 0) codeToOriginsSet[prod.codigo].add(sucursalOrigen);
//   });

//   const result = {};
//   const origenesResult = {};

//   Object.values(productsMap).forEach((prod) => {
//     const globalOrigins = codeToOriginsSet[prod.codigo] || new Set();

//     const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
//       sucursalOrigen: origen,
//       cantidad: qty,
//       ventasOrigen: prod.ventasOrigin[origen] || 0,
//     }));

//     const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
//       sucursalDestino: dest,
//       ventas: v.ventas,
//       stock: v.stock,
//     }));

//     const destinosValidos = destinosArr.filter(
//       (d) =>
//         d.ventas >= 5 &&
//         !globalOrigins.has(d.sucursalDestino) &&
//         !originsArr.some((o) => o.sucursalOrigen === d.sucursalDestino)
//     );

//     originsArr.forEach((origen) => {
//       if (origen.cantidad <= 0) return;

//       if (destinosValidos.length > 0) {
//         // Elegimos un solo destino (el primero válido)
//         const destino = destinosValidos[0];

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: prod.codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           sucursalDestino: destino.sucursalDestino,
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stock,
//           ventasOrigen: origen.ventasOrigen,
//         });

//         if (!origenesResult[origen.sucursalOrigen]) origenesResult[origen.sucursalOrigen] = [];
//         origenesResult[origen.sucursalOrigen].push({
//           codigo: prod.codigo,
//           producto: prod.producto,
//           sucursalDestino: destino.sucursalDestino,
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: destino.ventas,
//         });
//       } else {
//         // No hay destino válido, agregamos motivo
//         if (!origenesResult[origen.sucursalOrigen]) origenesResult[origen.sucursalOrigen] = [];
//         origenesResult[origen.sucursalOrigen].push({
//           codigo: prod.codigo,
//           producto: `${prod.producto} ❌ SIN DESTINO`,
//           sucursalDestino: "",
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: 0,
//         });
//       }
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };

const assignProducts = (rows) => {
  const productsMap = {}; // key: codigo -> {producto, origins, destinations, ventasOrigen}

  rows.forEach((r) => {
    const codigo = (r["Código de Barra"] ?? "").toString().trim();
    if (!codigo) return;

    const producto = r["Producto"] ?? "";
    const mes = (r["Mes"] ?? "").toString().trim();
    const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
    const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();

    const cantidad = Number(r["Cantidad"]) || 0;
    const ventas = Number(r["Unidades vendidas en destino"]) || 0;

    if (!productsMap[codigo]) {
      productsMap[codigo] = {
        producto,
        origins: {},       // sucursalOrigen -> {cantidad, mes}
        destinations: {},  // sucursalDestino -> ventas
        ventasOrigen: {},  // sucursalOrigen -> ventas en su propia sucursal
      };
    }

    const prod = productsMap[codigo];

    if (sucursalOrigen === sucursalDestino) {
      prod.ventasOrigen[sucursalOrigen] = (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
    } else {
      if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
      if (sucursalDestino && ventas >= 5) prod.destinations[sucursalDestino] = ventas;
    }
  });

  const result = {};
  const origenesResult = {};

  Object.entries(productsMap).forEach(([codigo, prod]) => {
    const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
      sucursalOrigen: origen,
      cantidad: info.cantidad,
      mes: info.mes,
      ventasOrigen: prod.ventasOrigen[origen] || 0,
    }));

    const destinosArr = Object.entries(prod.destinations)
      .map(([dest, ventas]) => ({ sucursalDestino: dest, ventas }))
      .sort((a, b) => b.ventas - a.ventas); // ordenar de mayor a menor ventas

    const blockedDestinations = new Set(Object.keys(prod.origins)); // sucursales con producto por vencer

    let idxDestino = 0;
    originsArr.forEach((origen) => {
      if (origen.cantidad <= 0) return;

      // Buscar primer destino válido
      let destino = null;
      for (let i = 0; i < destinosArr.length; i++) {
        const cand = destinosArr[(idxDestino + i) % destinosArr.length];
        if (!blockedDestinations.has(cand.sucursalDestino) && cand.sucursalDestino !== origen.sucursalOrigen) {
          destino = cand;
          idxDestino = (idxDestino + i + 1) % destinosArr.length;
          break;
        }
      }

      // No hay destino válido
      if (!destino) {
        if (!origenesResult[origen.sucursalOrigen]) origenesResult[origen.sucursalOrigen] = [];
        origenesResult[origen.sucursalOrigen].push({
          codigo,
          producto: prod.producto + " ❌ Sin destino",
          sucursalDestino: "",
          vence: origen.mes,
          cantidadTrasladar: origen.cantidad,
          ventasOrigen: origen.ventasOrigen,
          ventasDestino: 0,
        });
        return;
      }

      // Guardar en result por destino
      if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
      result[destino.sucursalDestino].push({
        codigo,
        producto: prod.producto,
        sucursalOrigen: origen.sucursalOrigen,
        vence: origen.mes,
        cantidadTrasladar: origen.cantidad,
        ventasDestino: destino.ventas,
        ventasOrigen: origen.ventasOrigen,
      });

      // Guardar en origen
      if (!origenesResult[origen.sucursalOrigen]) origenesResult[origen.sucursalOrigen] = [];
      origenesResult[origen.sucursalOrigen].push({
        codigo,
        producto: prod.producto,
        sucursalDestino: destino.sucursalDestino,
        vence: origen.mes,
        cantidadTrasladar: origen.cantidad,
        ventasOrigen: origen.ventasOrigen,
        ventasDestino: destino.ventas,
      });
    });
  });

  setGroupedBySucursal(result);
  setGroupedByOrigen(origenesResult);
};





  const exportToExcel = (data, isDestino) => {
    const wb = XLSX.utils.book_new();

    Object.keys(data).forEach((key) => {
      const cleanSheetName = key.substring(0, 31);
      const titulo = isDestino
        ? [`Sucursal de Destino: ${key}`]
        : [`Sucursal de Origen: ${key}`];

      const rows = data[key].map((item) => {
        if (isDestino) {
          return {
            "Sucursal Origen": item.sucursalOrigen,
            Código: item.codigo,
            Producto: item.producto,
            Vence: item.vence,
            "Cantidad a trasladar": item.cantidadTrasladar,
            "Ventas en origen": item.ventasOrigen,
            "Ventas en destino": item.ventasDestino,
            "Stock en destino": item.stockDestino,
          };
        } else {
          const productoConMotivo = item.productoMotivo
            ? `${item.producto} ${item.productoMotivo}`
            : item.producto;

          return {
            "Sucursal Destino (Ventas)": item.sucursalDestino
              ? `${item.sucursalDestino} (${item.ventasDestino})`
              : "",
            Código: item.codigo,
            Producto: productoConMotivo,
            Vence: item.vence,
            "Cantidad a preparar": item.cantidadTrasladar,
            "Ventas en origen": item.ventasOrigen,
            "Ventas en destino": item.ventasDestino,
          };
        }
      });

      const ws = XLSX.utils.aoa_to_sheet([titulo]);
      XLSX.utils.sheet_add_json(ws, rows, { origin: "A4" });
      XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
    });

    XLSX.writeFile(
      wb,
      isDestino ? "Distribucion_por_Destino.xlsx" : "Pedidos_por_Origen.xlsx"
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Plan de Traslado de Productos Críticos
      </Typography>

      <Button variant="contained" component="label">
        Cargar Excel
        <input type="file" hidden onChange={handleFileUpload} />
      </Button>

      {Object.keys(groupedBySucursal).length > 0 && (
        <>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mt: 3 }}
          >
            <Tab label="Distribución por Destino" />
            <Tab label="Pedidos por Origen" />
          </Tabs>

          {tab === 0 && (
            <>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => exportToExcel(groupedBySucursal, true)}
              >
                Exportar Excel (Distribución)
              </Button>
              {Object.keys(groupedBySucursal).map((suc) => (
                <Paper key={suc} sx={{ my: 3, p: 2 }}>
                  <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sucursal Origen</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Vence</TableCell>
                        <TableCell>Cantidad a trasladar</TableCell>
                        <TableCell>Ventas en origen</TableCell>
                        <TableCell>Ventas en destino</TableCell>
                        <TableCell>Stock en destino</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedBySucursal[suc].map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.sucursalOrigen}</TableCell>
                          <TableCell>{item.codigo}</TableCell>
                          <TableCell>{item.producto}</TableCell>
                          <TableCell>{item.vence}</TableCell>
                          <TableCell>{item.cantidadTrasladar}</TableCell>
                          <TableCell>{item.ventasOrigen}</TableCell>
                          <TableCell>{item.ventasDestino}</TableCell>
                          <TableCell>{item.stockDestino}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))}
            </>
          )}

          {tab === 1 && (
            <>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => exportToExcel(groupedByOrigen, false)}
              >
                Exportar Excel (Pedidos)
              </Button>
              {Object.keys(groupedByOrigen).map((origen) => (
                <Paper key={origen} sx={{ my: 3, p: 2 }}>
                  <Typography variant="h6">{`Sucursal origen: ${origen}`}</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Destino (Ventas)</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Vence</TableCell>
                        <TableCell>Cantidad a trasladas</TableCell>
                        <TableCell>Ventas en origen</TableCell>
                        <TableCell>Ventas en destino</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedByOrigen[origen].map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {item.sucursalDestino
                              ? `${item.sucursalDestino} (${item.ventasDestino})`
                              : ""}
                          </TableCell>
                          <TableCell>{item.codigo}</TableCell>
                          <TableCell>
                            {item.productoMotivo
                              ? `${item.producto} ${item.productoMotivo}`
                              : item.producto}
                          </TableCell>
                          <TableCell>{item.vence}</TableCell>
                          <TableCell>{item.cantidadTrasladar}</TableCell>
                          <TableCell>{item.ventasOrigen}</TableCell>
                          <TableCell>{item.ventasDestino}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))}
            </>
          )}
        </>
      )}
    </Box>
  );
}
