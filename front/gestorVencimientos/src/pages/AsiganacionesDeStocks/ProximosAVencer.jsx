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

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},       // sucursalOrigen -> {cantidad, mes}
//         destinations: {},  // sucursalDestino -> {ventas, stockDestino}
//         ventasOrigen: {},  // sucursalOrigen -> ventas propias
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
//       sucursalOrigen: origen,
//       cantidad: info.cantidad,
//       mes: info.mes,
//       ventasOrigen: prod.ventasOrigen[origen] || 0,
//     }));

//     // Ordenamos los destinos por ventas (prioridad)
//     const destinosArr = Object.entries(prod.destinations)
//       .map(([dest, info]) => ({
//         sucursalDestino: dest,
//         ventas: info.ventas,
//         stockDestino: info.stockDestino,
//       }))
//       .sort((a, b) => b.ventas - a.ventas);

//     // 🚫 Evitamos "pases de manos" (destinos que también son origen del mismo producto)
//     const destinosOrdenados = destinosArr.filter(
//       (d) => !prod.origins[d.sucursalDestino]
//     );

//     let idxDestino = 0;

//     // 3️⃣ Asignamos orígenes -> destinos
//     originsArr.forEach((origen) => {
//       const notas = [];

//       if (origen.cantidad <= 0) return;

//       if (destinosOrdenados.length === 0) {
//         notas.push("❌ No hay destinos potables disponibles");
//       }

//       const destino = destinosOrdenados[idxDestino % destinosOrdenados.length];
//       idxDestino++;
//       if (!destino) return;

//       if (!origenesResult[origen.sucursalOrigen])
//         origenesResult[origen.sucursalOrigen] = [];
//       if (!result[destino.sucursalDestino])
//         result[destino.sucursalDestino] = [];

//       // ⚠ Si el destino también tiene stock por vencer (aún después del filtro)
//       if (prod.origins[destino.sucursalDestino]) {
//         notas.push("⚠ Destino ya tiene producto por vencer");
//       }

//       const registro = {
//         codigo,
//         producto: prod.producto,
//         sucursalOrigen: origen.sucursalOrigen,
//         sucursalDestino: destino.sucursalDestino,
//         vence: origen.mes,
//         cantidadTrasladar: origen.cantidad,
//         ventasOrigen: origen.ventasOrigen,
//         ventasDestino: destino.ventas,
//         stockDestino: destino.stockDestino,
//         nota: notas.length ? notas.join("\n") : "",
//       };

//       result[destino.sucursalDestino].push(registro);
//       origenesResult[origen.sucursalOrigen].push(registro);
//     });

//     // 🔁 Nota informativa: si una sucursal recibe y también envía (detectado)
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];

//         origenesResult[origenKey].push({
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 4️⃣ Detección de conflictos: varios orígenes enviando al mismo destino
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   // 5️⃣ Guardamos resultados
//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };

// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},       // sucursalOrigen -> {cantidad, mes}
//         destinations: {},  // sucursalDestino -> {ventas, stockDestino}
//         ventasOrigen: {},  // sucursalOrigen -> ventas propias
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
//       sucursalOrigen: origen,
//       cantidad: info.cantidad,
//       mes: info.mes,
//       ventasOrigen: prod.ventasOrigen[origen] || 0,
//     }));

//     // Ordenamos los destinos por ventas (prioridad)
//     const destinosArr = Object.entries(prod.destinations)
//       .map(([dest, info]) => ({
//         sucursalDestino: dest,
//         ventas: info.ventas,
//         stockDestino: info.stockDestino,
//       }))
//       .sort((a, b) => b.ventas - a.ventas);

//     // 🚫 Evitamos "pases de manos" (destinos que también son origen del mismo producto)
//     const destinosOrdenados = destinosArr.filter(
//       (d) => !prod.origins[d.sucursalDestino]
//     );

//     // 3️⃣ Asignamos orígenes -> destinos de forma ponderada por ventas
//     originsArr.forEach((origen) => {
//       if (origen.cantidad <= 0) return;

//       const notas = [];
//       const totalVentasDestinos = destinosOrdenados.reduce(
//         (sum, d) => sum + (d.ventas || 0),
//         0
//       );

//       if (totalVentasDestinos === 0 || destinosOrdenados.length === 0) {
//         notas.push("❌ No hay destinos potables disponibles");
//         return;
//       }

//       // Calcular proporciones según ventas
//       const proporciones = destinosOrdenados.map((dest) => ({
//         ...dest,
//         peso: dest.ventas / totalVentasDestinos,
//       }));

//       // Asignación inicial redondeada
//     // Asignación inicial
// let totalAsignado = 0;
// const asignaciones = proporciones.map((p) => {
//   let cant = Math.floor(origen.cantidad * p.peso);
//   // Si tiene ventas > 5 y quedó en 0, le doy al menos 1
//   if (cant === 0 && p.ventas > 5) cant = 1;
//   totalAsignado += cant;
//   return { ...p, cantidad: cant };
// });

// // Si nos pasamos del total, recortamos empezando por los de menor ventas
// let exceso = totalAsignado - origen.cantidad;
// if (exceso > 0) {
//   const ordenadosPorMenor = [...asignaciones].sort(
//     (a, b) => a.ventas - b.ventas
//   );
//   for (let i = 0; i < ordenadosPorMenor.length && exceso > 0; i++) {
//     if (ordenadosPorMenor[i].cantidad > 1) {
//       ordenadosPorMenor[i].cantidad -= 1;
//       exceso--;
//     }
//   }
// }


//       // Crear registros de traslado
//       asignaciones.forEach((destino) => {
//         if (destino.cantidad <= 0) return;

//         if (!origenesResult[origen.sucursalOrigen])
//           origenesResult[origen.sucursalOrigen] = [];
//         if (!result[destino.sucursalDestino])
//           result[destino.sucursalDestino] = [];

//         const notasLocales = [...notas];
//         if (prod.origins[destino.sucursalDestino]) {
//           notasLocales.push("⚠ Destino ya tiene producto por vencer");
//         }

//         const registro = {
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           sucursalDestino: destino.sucursalDestino,
//           vence: origen.mes,
//           cantidadTrasladar: destino.cantidad,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stockDestino,
//           nota: notasLocales.length ? notasLocales.join("\n") : "",
//         };

//         result[destino.sucursalDestino].push(registro);
//         origenesResult[origen.sucursalOrigen].push(registro);
//       });
//     });

//     // 🔁 Nota informativa: si una sucursal recibe y también envía (detectado)
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];

//         origenesResult[origenKey].push({
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 4️⃣ Detección de conflictos: varios orígenes enviando al mismo destino
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   // 5️⃣ Guardamos resultados
//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };




// //ANDA BIEN
// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},
//         destinations: {},
//         ventasOrigen: {},
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino, mes };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
//       sucursalOrigen: origen,
//       cantidad: info.cantidad,
//       mes: info.mes,
//       ventasOrigen: prod.ventasOrigen[origen] || 0,
//     }));

//     // Destinos ordenados por ventas y vencimiento
//     const destinosArr = Object.entries(prod.destinations)
//       .map(([dest, info]) => ({
//         sucursalDestino: dest,
//         ventas: info.ventas,
//         stockDestino: info.stockDestino,
//         mes: info.mes,
//       }))
//       .sort((a, b) => b.ventas - a.ventas || b.mes - a.mes);

//     // Evitamos "pases de manos"
//     const destinosOrdenados = destinosArr.filter(
//       (d) => !prod.origins[d.sucursalDestino]
//     );

//     // --- Round-robin global por destino ---
//     let destinoIdx = 0; // índice de destino actual

//     originsArr.forEach((origen) => {
//       if (origen.cantidad <= 0) return;

//       let restante = origen.cantidad;
//       const notas = [];

//       while (restante > 0 && destinosOrdenados.length > 0) {
//         const destino = destinosOrdenados[destinoIdx % destinosOrdenados.length];

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         if (!origenesResult[origen.sucursalOrigen])
//           origenesResult[origen.sucursalOrigen] = [];

//         const notasLocales = [...notas];
//         if (prod.origins[destino.sucursalDestino]) {
//           notasLocales.push("⚠ Destino ya tiene producto por vencer");
//         }

//         const registro = {
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           sucursalDestino: destino.sucursalDestino,
//           vence: origen.mes,
//           cantidadTrasladar: 1, // asignamos de a 1
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stockDestino,
//           nota: notasLocales.length ? notasLocales.join("\n") : "",
//         };

//         result[destino.sucursalDestino].push(registro);
//         origenesResult[origen.sucursalOrigen].push(registro);

//         restante--;
//         destinoIdx++; // siguiente destino
//       }
//     });

//     // Nota si sucursal envía y recibe
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];

//         origenesResult[origenKey].push({
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 4️⃣ Detección de conflictos
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };


//TMB ANDA MUY BIEN
// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},
//         destinations: {},
//         ventasOrigen: {},
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino, mes };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
//       sucursalOrigen: origen,
//       cantidad: info.cantidad,
//       mes: info.mes,
//       ventasOrigen: prod.ventasOrigen[origen] || 0,
//     }));

//     // Destinos válidos, evitando que sean origen
//     const destinosArr = Object.entries(prod.destinations)
//       .filter(([dest]) => !prod.origins[dest])
//       .map(([dest, info]) => ({
//         sucursalDestino: dest,
//         ventas: info.ventas,
//         stockDestino: info.stockDestino,
//         mes: info.mes,
//       }))
//       .sort((a, b) => b.ventas - a.ventas || b.mes - a.mes); // prioridad ventas y vencimiento

//     if (destinosArr.length === 0) return; // ningún destino válido

//     // 3️⃣ Round-robin por unidad entre todos los destinos
//     let destinoIdx = 0;
//     originsArr.forEach((origen) => {
//       let restante = origen.cantidad;
//       while (restante > 0) {
//         const destino = destinosArr[destinoIdx % destinosArr.length];

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         if (!origenesResult[origen.sucursalOrigen])
//           origenesResult[origen.sucursalOrigen] = [];

//         const notas = [];
//         if (prod.origins[destino.sucursalDestino]) {
//           notas.push("⚠ Destino ya tiene producto por vencer");
//         }

//         const registro = {
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           sucursalDestino: destino.sucursalDestino,
//           vence: origen.mes,
//           cantidadTrasladar: 1,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stockDestino,
//           nota: notas.length ? notas.join("\n") : "",
//         };

//         result[destino.sucursalDestino].push(registro);
//         origenesResult[origen.sucursalOrigen].push(registro);

//         restante--;
//         destinoIdx++;
//       }
//     });

//     // Nota si sucursal envía y recibe
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];

//         origenesResult[origenKey].push({
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 4️⃣ Detección de conflictos
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };



// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},
//         destinations: {},
//         ventasOrigen: {},
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino, mes };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const originsArr = Object.entries(prod.origins).map(([origen, info]) => ({
//       sucursalOrigen: origen,
//       cantidad: info.cantidad,
//       mes: info.mes,
//       ventasOrigen: prod.ventasOrigen[origen] || 0,
//     }));

//     const destinosArr = Object.entries(prod.destinations)
//       .map(([dest, info]) => ({
//         sucursalDestino: dest,
//         ventas: info.ventas,
//         stockDestino: info.stockDestino,
//         mes: info.mes,
//       }))
//       .sort((a, b) => b.ventas - a.ventas || b.mes - a.mes);

//     const destinosOrdenados = destinosArr.filter(
//       (d) => !prod.origins[d.sucursalDestino]
//     );

//     originsArr.forEach((origen) => {
//       if (origen.cantidad <= 0) return;

//       let restante = origen.cantidad;
//       const notas = [];

//       // ✅ Reparto proporcional ajustado
//       const totalVentas = destinosOrdenados.reduce((sum, d) => sum + d.ventas, 0);

//       // Paso 1: asignación proporcional inicial
//       const asignaciones = destinosOrdenados.map((dest) => {
//         const cant = Math.floor(restante * (dest.ventas / totalVentas));
//         return { ...dest, cantidad: cant };
//       });

//       // Paso 2: calcular remanente
//       let totalAsignado = asignaciones.reduce((sum, a) => sum + a.cantidad, 0);
//       let remanente = restante - totalAsignado;

//       // Paso 3: repartir remanente de mayor a menor ventas
//       asignaciones.sort((a, b) => b.ventas - a.ventas);
//       let idx = 0;
//       while (remanente > 0 && asignaciones.length > 0) {
//         asignaciones[idx % asignaciones.length].cantidad += 1;
//         remanente--;
//         idx++;
//       }

//       // Crear registros finales
//       asignaciones.forEach((destino) => {
//         if (destino.cantidad <= 0) return;

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         if (!origenesResult[origen.sucursalOrigen])
//           origenesResult[origen.sucursalOrigen] = [];

//         const notasLocales = [...notas];
//         if (prod.origins[destino.sucursalDestino]) {
//           notasLocales.push("⚠ Destino ya tiene producto por vencer");
//         }

//         const registro = {
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           sucursalDestino: destino.sucursalDestino,
//           vence: origen.mes,
//           cantidadTrasladar: destino.cantidad,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stockDestino,
//           nota: notasLocales.length ? notasLocales.join("\n") : "",
//         };

//         result[destino.sucursalDestino].push(registro);
//         origenesResult[origen.sucursalOrigen].push(registro);
//       });
//     });

//     // Nota si sucursal envía y recibe
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];

//         origenesResult[origenKey].push({
//           codigo,
//           producto: prod.producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 4️⃣ Detección de conflictos
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1) {
//         if (!item.nota.includes("⚠ Probable problema")) {
//           item.nota =
//             (item.nota ? item.nota + "\n" : "") +
//             "⚠ Probable problema: varias sucursales enviando";
//         }
//       }
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };


//CODIGO FINAL 1
// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos el mapa de productos
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();
//     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"]) || 0;
//     const stockDestino = Number(r["Stock en destino"]) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},
//         destinations: {},
//         ventasOrigen: {},
//       };
//     }

//     const prod = productsMap[codigo];

//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
//       if (sucursalDestino && ventas >= 5)
//         prod.destinations[sucursalDestino] = { ventas, stockDestino, mes };
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesamos cada producto globalmente
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const producto = prod.producto;
//     const originsArr = Object.entries(prod.origins).map(([s, d]) => ({
//       sucursal: s,
//       cantidad: d.cantidad,
//       mes: d.mes,
//       ventasOrigen: prod.ventasOrigen[s] || 0,
//     }));

//     // Destinos válidos: ventas > umbral
//     const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
//       sucursal: s,
//       ventas: d.ventas,
//       stockDestino: d.stockDestino,
//       mes: d.mes,
//       tieneVencidos: !!prod.origins[s], // marcar si destino tiene stock por vencer
//     }));

//     if (destinosArr.length === 0) {
//       // Sin destinos válidos
//       originsArr.forEach((origen) => {
//         if (!origenesResult[origen.sucursal]) origenesResult[origen.sucursal] = [];
//         origenesResult[origen.sucursal].push({
//           codigo,
//           producto,
//           sucursalOrigen: origen.sucursal,
//           sucursalDestino: "",
//           vence: origen.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "❌ No hay destinos potables disponibles",
//         });
//       });
//       return;
//     }

//     // 🔢 Paso 1: total global disponible y total ventas destinos
//     const totalDisponible = originsArr.reduce((s, o) => s + o.cantidad, 0);
//     const totalVentas = destinosArr.reduce((s, d) => s + d.ventas, 0);

//     // Paso 2: distribución proporcional
//     let asignaciones = destinosArr.map((d) => ({
//       ...d,
//       cantidad: Math.floor((totalDisponible * d.ventas) / totalVentas),
//     }));

//     // Paso 3: repartir remanente
//     let totalAsignado = asignaciones.reduce((s, a) => s + a.cantidad, 0);
//     let remanente = totalDisponible - totalAsignado;
//     let i = 0;
//     while (remanente > 0 && asignaciones.length > 0) {
//       asignaciones[i % asignaciones.length].cantidad++;
//       remanente--;
//       i++;
//     }

//     // Paso 4: distribuir físicamente desde orígenes
//     const colaOrigenes = [...originsArr];
//     asignaciones.forEach((dest) => {
//       let cantidadDestino = dest.cantidad;
//       if (cantidadDestino <= 0) return;

//       if (!result[dest.sucursal]) result[dest.sucursal] = [];

//       while (cantidadDestino > 0 && colaOrigenes.length > 0) {
//         const origen = colaOrigenes[0];
//         const mover = Math.min(origen.cantidad, cantidadDestino);

//         const notas = [];
//         if (dest.tieneVencidos) {
//           notas.push("⚠ Destino ya tiene producto por vencer");
//         }

//         const registro = {
//           codigo,
//           producto,
//           sucursalOrigen: origen.sucursal,
//           sucursalDestino: dest.sucursal,
//           vence: origen.mes,
//           cantidadTrasladar: mover,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: dest.ventas,
//           stockDestino: dest.stockDestino,
//           nota: notas.join("\n"),
//         };

//         if (!origenesResult[origen.sucursal]) origenesResult[origen.sucursal] = [];
//         origenesResult[origen.sucursal].push(registro);
//         result[dest.sucursal].push(registro);

//         origen.cantidad -= mover;
//         cantidadDestino -= mover;

//         if (origen.cantidad <= 0) colaOrigenes.shift();
//       }
//     });

//     // ⚠ Caso: sucursal que envía y recibe
//     Object.keys(prod.origins).forEach((origenKey) => {
//       if (prod.destinations[origenKey]) {
//         if (!origenesResult[origenKey]) origenesResult[origenKey] = [];
//         origenesResult[origenKey].push({
//           codigo,
//           producto,
//           sucursalOrigen: origenKey,
//           sucursalDestino: "",
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: prod.origins[origenKey].cantidad,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota:
//             "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//         });
//       }
//     });
//   });

//   // 5️⃣ Detección de conflictos (mismo destino con múltiples orígenes)
//   const conflictMap = {};
//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       conflictMap[key] = (conflictMap[key] || 0) + 1;
//     });
//   });

//   Object.entries(result).forEach(([destino, items]) => {
//     items.forEach((item) => {
//       const key = `${item.codigo}|${destino}`;
//       if (conflictMap[key] > 1 && !item.nota.includes("⚠ Probable problema")) {
//         item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
//       }
//     });
//   });

//   Object.entries(origenesResult).forEach(([origen, items]) => {
//     items.forEach((item) => {
//       if (!item.sucursalDestino) return;
//       const key = `${item.codigo}|${item.sucursalDestino}`;
//       if (conflictMap[key] > 1 && !item.nota.includes("⚠ Probable problema")) {
//         item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
//       }
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };

const assignProducts = (rows) => {
  const productsMap = {};

  // 1️⃣ Armamos el mapa de productos
  rows.forEach((r) => {
    const codigo = (r["Código de Barra"] ?? "").toString().trim();
    if (!codigo) return;

    const producto = r["Producto"] ?? "";
    const mes = (r["Mes"] ?? "").toString().trim();
    const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
    const sucursalDestino = (r["Sucursal de destino"] ?? "").toString().trim();
    const cantidad = Number(r["Cantidad"]) || 0;
    const ventas = Number(r["Unidades vendidas en destino"]) || 0;
    const stockDestino = Number(r["Stock en destino"]) || 0;

    if (!productsMap[codigo]) {
      productsMap[codigo] = {
        producto,
        origins: {},
        destinations: {},
        ventasOrigen: {},
      };
    }

    const prod = productsMap[codigo];

    if (sucursalOrigen === sucursalDestino) {
      prod.ventasOrigen[sucursalOrigen] =
        (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
    } else {
      if (cantidad > 0) prod.origins[sucursalOrigen] = { cantidad, mes };
      if (sucursalDestino && ventas >= 5)
        prod.destinations[sucursalDestino] = { ventas, stockDestino, mes };
    }
  });

  const result = {};
  const origenesResult = {};

  // 2️⃣ Procesamos cada producto globalmente
  Object.entries(productsMap).forEach(([codigo, prod]) => {
    const producto = prod.producto;
    const originsArr = Object.entries(prod.origins).map(([s, d]) => ({
      sucursal: s,
      cantidad: d.cantidad,
      mes: d.mes,
      ventasOrigen: prod.ventasOrigen[s] || 0,
    }));

    // Destinos válidos
    const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
      sucursal: s,
      ventas: d.ventas,
      stockDestino: d.stockDestino,
      mes: d.mes,
      tieneVencidos: !!prod.origins[s],
    }));

    if (destinosArr.length === 0) {
      // Sin destinos válidos
      originsArr.forEach((origen) => {
        if (!origenesResult[origen.sucursal]) origenesResult[origen.sucursal] = [];
        origenesResult[origen.sucursal].push({
          codigo,
          producto,
          sucursalOrigen: origen.sucursal,
          sucursalDestino: "",
          vence: origen.mes,
          cantidadTrasladar: origen.cantidad,
          ventasOrigen: origen.ventasOrigen,
          ventasDestino: 0,
          stockDestino: 0,
          nota: "❌ No hay destinos potables disponibles",
        });
      });
      return;
    }

    const totalDisponible = originsArr.reduce((s, o) => s + o.cantidad, 0);

    // 🔹 Separar destinos limpios y con stock por vencer
    let destinosLimpios = destinosArr.filter(d => !d.tieneVencidos);
    let destinosConVencidos = destinosArr.filter(d => d.tieneVencidos);

    let destinosFinales = destinosLimpios.length > 0 ? destinosLimpios : destinosArr;

    // Paso 2: total de ventas para distribución proporcional
    const totalVentas = destinosFinales.reduce((s, d) => s + d.ventas, 0);
    let asignaciones = destinosFinales.map((d) => ({
      ...d,
      cantidad: Math.floor((totalDisponible * d.ventas) / totalVentas),
    }));

    // Paso 3: repartir remanente
    let totalAsignado = asignaciones.reduce((s, a) => s + a.cantidad, 0);
    let remanente = totalDisponible - totalAsignado;
    let i = 0;
    while (remanente > 0 && asignaciones.length > 0) {
      asignaciones[i % asignaciones.length].cantidad++;
      remanente--;
      i++;
    }

    // Paso 4: distribuir físicamente desde orígenes
    const colaOrigenes = [...originsArr];
    asignaciones.forEach((dest) => {
      let cantidadDestino = dest.cantidad;
      if (cantidadDestino <= 0) return;

      if (!result[dest.sucursal]) result[dest.sucursal] = [];

      while (cantidadDestino > 0 && colaOrigenes.length > 0) {
        const origen = colaOrigenes[0];
        const mover = Math.min(origen.cantidad, cantidadDestino);

        const notas = [];
        if (dest.tieneVencidos) {
          notas.push("⚠ Destino ya tiene producto por vencer");
        }

        const registro = {
          codigo,
          producto,
          sucursalOrigen: origen.sucursal,
          sucursalDestino: dest.sucursal,
          vence: origen.mes,
          cantidadTrasladar: mover,
          ventasOrigen: origen.ventasOrigen,
          ventasDestino: dest.ventas,
          stockDestino: dest.stockDestino,
          nota: notas.join("\n"),
        };

        if (!origenesResult[origen.sucursal]) origenesResult[origen.sucursal] = [];
        origenesResult[origen.sucursal].push(registro);
        result[dest.sucursal].push(registro);

        origen.cantidad -= mover;
        cantidadDestino -= mover;

        if (origen.cantidad <= 0) colaOrigenes.shift();
      }
    });

    // ⚠ Caso: sucursal que envía y recibe
    Object.keys(prod.origins).forEach((origenKey) => {
      if (prod.destinations[origenKey]) {
        if (!origenesResult[origenKey]) origenesResult[origenKey] = [];
        origenesResult[origenKey].push({
          codigo,
          producto,
          sucursalOrigen: origenKey,
          sucursalDestino: origenKey,
          vence: prod.origins[origenKey].mes,
          cantidadTrasladar: 0,
          ventasOrigen: prod.ventasOrigen[origenKey] || 0,
          ventasDestino: prod.destinations[origenKey].ventas || 0,
          stockDestino: prod.destinations[origenKey].stockDestino || 0,
          nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
          tipo: "advertencia",
        });
      }
    });
  });

  // 5️⃣ Detección de conflictos (mismo destino con múltiples orígenes)
  const conflictMap = {};
  Object.entries(result).forEach(([destino, items]) => {
    items.forEach((item) => {
      const key = `${item.codigo}|${destino}`;
      conflictMap[key] = (conflictMap[key] || 0) + 1;
    });
  });

  Object.entries(result).forEach(([destino, items]) => {
    items.forEach((item) => {
      const key = `${item.codigo}|${destino}`;
      if (conflictMap[key] > 1 && !item.nota.includes("⚠ Probable problema")) {
        item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
      }
    });
  });

  Object.entries(origenesResult).forEach(([origen, items]) => {
    items.forEach((item) => {
      if (!item.sucursalDestino) return;
      const key = `${item.codigo}|${item.sucursalDestino}`;
      if (conflictMap[key] > 1 && !item.nota.includes("⚠ Probable problema")) {
        item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
      }
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
          "Stock en destino": item.stockDestino ?? 0,
          Nota: item.nota ?? "",
        };
      } else {
        return {
          "Sucursal Destino (Ventas)": item.sucursalDestino
            ? `${item.sucursalDestino} (${item.ventasDestino})`
            : "",
          Código: item.codigo,
          Producto: item.producto,
          Vence: item.vence,
          "Cantidad a preparar": item.cantidadTrasladar,
          "Ventas en origen": item.ventasOrigen,
          "Ventas en destino": item.ventasDestino,
          "Stock en destino": item.stockDestino ?? 0,
          Nota: item.nota ?? "",
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

  console.log("groupedByOrigen", groupedByOrigen);
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
                        <TableCell>Nota</TableCell>
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
                          <TableCell>{item.nota}</TableCell>
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
                        <TableCell>Cantidad a trasladar</TableCell>
                        <TableCell>Ventas en origen</TableCell>
                        <TableCell>Ventas en destino</TableCell>
                        <TableCell>Nota</TableCell>
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
                          <TableCell>{item.producto}</TableCell>
                          <TableCell>{item.vence}</TableCell>
                          <TableCell>{item.cantidadTrasladar}</TableCell>
                          <TableCell>{item.ventasOrigen}</TableCell>
                          <TableCell>{item.ventasDestino}</TableCell>
                          <TableCell>{item.nota}</TableCell>
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
