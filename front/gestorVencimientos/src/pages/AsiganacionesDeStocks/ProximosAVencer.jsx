// // import React, { useState } from "react";
// // import * as XLSX from "xlsx";
// // import {
// //   Box,
// //   Typography,
// //   Button,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableRow,
// //   Paper,
// // } from "@mui/material";

// // export default function TrasladoProductos() {
// //   const [groupedBySucursal, setGroupedBySucursal] = useState({});

// //   const handleFileUpload = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     const reader = new FileReader();
// //     reader.onload = (evt) => {
// //       const bstr = evt.target.result;
// //       const wb = XLSX.read(bstr, { type: "binary" });
// //       const wsname = wb.SheetNames[0];
// //       const ws = wb.Sheets[wsname];
// //       const jsonData = XLSX.utils.sheet_to_json(ws);
// //       assignProducts(jsonData);
// //     };
// //     reader.readAsBinaryString(file);
// //   };

// //   const assignProducts = (rows) => {
// //     const groupedProducts = {};

// //     rows.forEach((row) => {
// //       const codigo = row["Código de Barra"];
// //       const producto = row["Producto"];
// //       const mes = row["Mes"];
// //       const sucursalOrigen = row["Sucursal"];
// //       const cantidad = Number(row["Cantidad"] ?? 0);

// //       const key = `${sucursalOrigen}-${codigo}-${mes}`;

// //       if (!groupedProducts[key]) {
// //         groupedProducts[key] = {
// //           codigo,
// //           producto,
// //           mes,
// //           sucursalOrigen,
// //           cantidadTotal: cantidad,
// //           destinos: [],
// //         };
// //       }

// //       const sucursalDestino = row["Sucursal de destino"];
// //       const unidadesVendidas = Number(row["Unidades vendidas en destino"] ?? 0);
// //       const stock = Number(row["Stock"] ?? 0);

// //       groupedProducts[key].destinos.push({
// //         sucursal: sucursalDestino,
// //         unidadesVendidas,
// //         stock,
// //       });
// //     });

// //     const result = {};

// //     Object.values(groupedProducts).forEach((prod) => {
// //       const destinosValidos = prod.destinos.filter(
// //         (d) => d.unidadesVendidas >= 5
// //       );
// //       if (destinosValidos.length === 0) return;

// //       destinosValidos.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);
// //       const mejorDestino = destinosValidos[0];

// //       if (!result[mejorDestino.sucursal]) result[mejorDestino.sucursal] = [];
// //       result[mejorDestino.sucursal].push({
// //         codigo: prod.codigo,
// //         producto: prod.producto,
// //         sucursalOrigen: prod.sucursalOrigen,
// //         vence: prod.mes,
// //         cantidadTrasladar: prod.cantidadTotal,
// //         ventasDestino: mejorDestino.unidadesVendidas,
// //         stockDestino: mejorDestino.stock,
// //       });
// //     });

// //     setGroupedBySucursal(result);
// //   };

// //   return (
// //     <Box p={3}>
// //       <Typography variant="h5" gutterBottom>
// //         Plan de Traslado de Productos Críticos
// //       </Typography>

// //       <Button variant="contained" component="label">
// //         Cargar Excel
// //         <input type="file" hidden onChange={handleFileUpload} />
// //       </Button>

// //       {Object.keys(groupedBySucursal).length === 0 && (
// //         <Typography variant="body1" sx={{ mt: 2 }}>
// //           Carga un archivo para ver el plan de traslado.
// //         </Typography>
// //       )}

// //       {Object.keys(groupedBySucursal).map((suc) => (
// //         <Paper key={suc} sx={{ my: 3, p: 2 }}>
// //           <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
// //           <Table size="small">
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>Sucursal Origen</TableCell>
// //                 <TableCell>Código</TableCell>
// //                 <TableCell>Producto</TableCell>
// //                 <TableCell>Vence</TableCell>
// //                 <TableCell>Cantidad a trasladar</TableCell>
// //                 <TableCell>Ventas en destino</TableCell>
// //                 <TableCell>Stock en destino</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {groupedBySucursal[suc].map((item, i) => (
// //                 <TableRow key={i}>
// //                   <TableCell>{item.sucursalOrigen}</TableCell>
// //                   <TableCell>{item.codigo}</TableCell>
// //                   <TableCell>{item.producto}</TableCell>
// //                   <TableCell>{item.vence}</TableCell>
// //                   <TableCell>{item.cantidadTrasladar}</TableCell>
// //                   <TableCell>{item.ventasDestino}</TableCell>
// //                   <TableCell>{item.stockDestino}</TableCell>
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </Paper>
// //       ))}
// //     </Box>
// //   );
// // }

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
// } from "@mui/material";

// export default function TrasladoProductos() {
//   const [groupedBySucursal, setGroupedBySucursal] = useState({});

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
//     const groupedProducts = {};

//     rows.forEach((row) => {
//       const codigo = row["Código de Barra"];
//       const producto = row["Producto"];
//       const mes = row["Mes"];
//       const sucursalOrigen = row["Sucursal"];
//       const sucursalDestino = row["Sucursal de destino"];
//       const cantidad = Number(row["Cantidad"] ?? 0);
//       const unidadesVendidas = Number(row["Unidades vendidas en destino"] ?? 0);
//       const stock = Number(row["Stock"] ?? 0);

//       // 🔑 Ahora incluimos destino en la key para que no se mezclen
//       const key = `${sucursalOrigen}-${codigo}-${mes}-${sucursalDestino}`;

//       if (!groupedProducts[key]) {
//         groupedProducts[key] = {
//           codigo,
//           producto,
//           mes,
//           sucursalOrigen,
//           sucursalDestino,
//           cantidadTotal: 0,
//           unidadesVendidas: 0,
//           stock,
//         };
//       }

//       groupedProducts[key].cantidadTotal += cantidad;
//       groupedProducts[key].unidadesVendidas += unidadesVendidas;
//       groupedProducts[key].stock = stock;
//     });

//     // Ahora agrupamos por destino, pero ya tenemos cantidades separadas
//     const result = {};

//     // Agrupamos primero por producto (sin destino) para poder elegir los top destinos
//     const productosPorKey = {};
//     Object.values(groupedProducts).forEach((item) => {
//       const baseKey = `${item.sucursalOrigen}-${item.codigo}-${item.mes}`;
//       if (!productosPorKey[baseKey]) {
//         productosPorKey[baseKey] = [];
//       }
//       productosPorKey[baseKey].push(item);
//     });

//     Object.values(productosPorKey).forEach((items) => {
//       // Ordenamos destinos por ventas
//       const destinosValidos = items.filter((i) => i.unidadesVendidas >= 5);
//       if (destinosValidos.length === 0) return;

//       destinosValidos.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);

//       // Determinamos cantidad de destinos según total de unidades a vencer
//       const cantidadTotal = items.reduce((acc, cur) => acc + cur.cantidadTotal, 0);
//       let cantidadDestinos = 1;
//       if (cantidadTotal > 7) cantidadDestinos = 4;
//       else if (cantidadTotal > 5) cantidadDestinos = 3;
//       else if (cantidadTotal > 3) cantidadDestinos = 2;

//       const seleccionados = destinosValidos.slice(
//         0,
//         Math.min(cantidadDestinos, destinosValidos.length)
//       );

//       // Ahora agregamos cada destino con su propia cantidad
//       seleccionados.forEach((destino) => {
//         if (!result[destino.sucursalDestino])
//           result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: destino.codigo,
//           producto: destino.producto,
//           sucursalOrigen: destino.sucursalOrigen,
//           vence: destino.mes,
//           cantidadTrasladar: destino.cantidadTotal, // 🔑 usamos la de este destino, no la sumada
//           ventasDestino: destino.unidadesVendidas,
//           stockDestino: destino.stock,
//         });
//       });
//     });

//     setGroupedBySucursal(result);
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

//       {Object.keys(groupedBySucursal).length === 0 && (
//         <Typography variant="body1" sx={{ mt: 2 }}>
//           Carga un archivo para ver el plan de traslado.
//         </Typography>
//       )}

//       {Object.keys(groupedBySucursal).map((suc) => (
//         <Paper key={suc} sx={{ my: 3, p: 2 }}>
//           <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell>Sucursal Origen</TableCell>
//                 <TableCell>Código</TableCell>
//                 <TableCell>Producto</TableCell>
//                 <TableCell>Vence</TableCell>
//                 <TableCell>Cantidad a trasladar</TableCell>
//                 <TableCell>Ventas en destino</TableCell>
//                 <TableCell>Stock en destino</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {groupedBySucursal[suc].map((item, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{item.sucursalOrigen}</TableCell>
//                   <TableCell>{item.codigo}</TableCell>
//                   <TableCell>{item.producto}</TableCell>
//                   <TableCell>{item.vence}</TableCell>
//                   <TableCell>{item.cantidadTrasladar}</TableCell>
//                   <TableCell>{item.ventasDestino}</TableCell>
//                   <TableCell>{item.stockDestino}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       ))}
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
// } from "@mui/material";

// export default function TrasladoProductos() {
//   const [groupedBySucursal, setGroupedBySucursal] = useState({});

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
//     const groupedProducts = {};

//     rows.forEach((row) => {
//       const codigo = row["Código de Barra"];
//       const producto = row["Producto"];
//       const mes = row["Mes"];
//       const sucursalOrigen = row["Sucursal"];
//       const sucursalDestino = row["Sucursal de destino"];
//       const cantidad = Number(row["Cantidad"] ?? 0);
//       const unidadesVendidas = Number(row["Unidades vendidas en destino"] ?? 0);
//       const stock = Number(row["Stock"] ?? 0);

//       // Key única incluyendo sucursal destino
//       const key = `${sucursalOrigen}-${codigo}-${mes}-${sucursalDestino}`;

//       if (!groupedProducts[key]) {
//         groupedProducts[key] = {
//           codigo,
//           producto,
//           mes,
//           sucursalOrigen,
//           sucursalDestino,
//           cantidadTotal: 0,
//           unidadesVendidas: 0,
//           stock,
//         };
//       }

//       groupedProducts[key].cantidadTotal += cantidad;
//       groupedProducts[key].unidadesVendidas += unidadesVendidas;
//       groupedProducts[key].stock = stock;
//     });

//     const result = {};

//     // Agrupamos por producto para poder elegir top destinos
//     const productosPorKey = {};
//     Object.values(groupedProducts).forEach((item) => {
//       const baseKey = `${item.sucursalOrigen}-${item.codigo}-${item.mes}`;
//       if (!productosPorKey[baseKey]) {
//         productosPorKey[baseKey] = [];
//       }
//       productosPorKey[baseKey].push(item);
//     });

//     Object.values(productosPorKey).forEach((items) => {
//       const destinosValidos = items.filter((i) => i.unidadesVendidas >= 5);
//       if (destinosValidos.length === 0) return;

//       destinosValidos.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);

//       const cantidadTotal = items.reduce((acc, cur) => acc + cur.cantidadTotal, 0);
//       let cantidadDestinos = 1;

//       if (cantidadTotal > 7) cantidadDestinos = 4;
//       else if (cantidadTotal > 5) cantidadDestinos = 3;
//       else if (cantidadTotal > 3) cantidadDestinos = 2;
//       else cantidadDestinos = 1; // 🔑 fuerza top 1 si hay pocas unidades

//       const seleccionados = destinosValidos.slice(0, cantidadDestinos);

//       seleccionados.forEach((destino) => {
//         if (!result[destino.sucursalDestino])
//           result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: destino.codigo,
//           producto: destino.producto,
//           sucursalOrigen: destino.sucursalOrigen,
//           vence: destino.mes,
//           cantidadTrasladar: destino.cantidadTotal, // Cantidad de ese destino
//           ventasDestino: destino.unidadesVendidas,
//           stockDestino: destino.stock,
//         });
//       });
//     });

//     setGroupedBySucursal(result);
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

//       {Object.keys(groupedBySucursal).length === 0 && (
//         <Typography variant="body1" sx={{ mt: 2 }}>
//           Carga un archivo para ver el plan de traslado.
//         </Typography>
//       )}

//       {Object.keys(groupedBySucursal).map((suc) => (
//         <Paper key={suc} sx={{ my: 3, p: 2 }}>
//           <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell>Sucursal Origen</TableCell>
//                 <TableCell>Código</TableCell>
//                 <TableCell>Producto</TableCell>
//                 <TableCell>Vence</TableCell>
//                 <TableCell>Cantidad a trasladar</TableCell>
//                 <TableCell>Ventas en destino</TableCell>
//                 <TableCell>Stock en destino</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {groupedBySucursal[suc].map((item, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{item.sucursalOrigen}</TableCell>
//                   <TableCell>{item.codigo}</TableCell>
//                   <TableCell>{item.producto}</TableCell>
//                   <TableCell>{item.vence}</TableCell>
//                   <TableCell>{item.cantidadTrasladar}</TableCell>
//                   <TableCell>{item.ventasDestino}</TableCell>
//                   <TableCell>{item.stockDestino}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       ))}
//     </Box>
//   );
// }

// //ANDA PERFECTO
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
// } from "@mui/material";

// export default function TrasladoProductos() {
//   const [groupedBySucursal, setGroupedBySucursal] = useState({});

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
//     const productsMap = {};

//     rows.forEach((r) => {
//       const codigo = (r["Código de Barra"] ?? "").toString().trim();
//       if (!codigo) return;

//       const producto = r["Producto"] ?? "";
//       const mes = (r["Mes"] ?? "").toString().trim();
//       const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//       const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN").toString().trim();

//       if (sucursalOrigen === sucursalDestino) return; // ❌ evitar traslado origen=destino

//       const cantidad = parseNumber(r["Cantidad"]);
//       const ventas = parseNumber(r["Unidades vendidas en destino"]);
//       const stock = parseNumber(r["Stock"]);

//       const prodKey = `${codigo}||${mes}`;
//       if (!productsMap[prodKey]) {
//         productsMap[prodKey] = {
//           codigo,
//           producto,
//           mes,
//           origins: {}, // origen -> cantidad (UNICA)
//           destinations: {}, // destino -> { ventas, stock }
//         };
//       }

//       // ✅ Solo sumamos una vez por origen
//       if (!productsMap[prodKey].origins[sucursalOrigen]) {
//         productsMap[prodKey].origins[sucursalOrigen] = cantidad;
//       }

//       // ✅ Guardamos el mejor dato de ventas/stock por destino
//       if (!productsMap[prodKey].destinations[sucursalDestino]) {
//         productsMap[prodKey].destinations[sucursalDestino] = {
//           ventas,
//           stock,
//         };
//       }
//     });

//     const result = {};

//     Object.values(productsMap).forEach((prod) => {
//       const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
//         sucursalOrigen: origen,
//         cantidad: qty,
//       }));

//       const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
//         sucursalDestino: dest,
//         ventas: v.ventas,
//         stock: v.stock,
//       }));

//       const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
//       if (destinosValidos.length === 0) return;

//       destinosValidos.sort((a, b) => b.ventas - a.ventas);

//       let idxDestino = 0;
//       originsArr.forEach((origen) => {
//         if (origen.cantidad <= 0) return;

//         const destino = destinosValidos[idxDestino % destinosValidos.length];

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: prod.codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad, // ✅ ahora es la cantidad real (no sumada)
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stock,
//         });

//         idxDestino++;
//       });
//     });

//     setGroupedBySucursal(result);
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

//       {Object.keys(groupedBySucursal).length === 0 && (
//         <Typography variant="body1" sx={{ mt: 2 }}>
//           Carga un archivo para ver el plan de traslado.
//         </Typography>
//       )}

//       {Object.keys(groupedBySucursal).map((suc) => (
//         <Paper key={suc} sx={{ my: 3, p: 2 }}>
//           <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell>Sucursal Origen</TableCell>
//                 <TableCell>Código</TableCell>
//                 <TableCell>Producto</TableCell>
//                 <TableCell>Vence</TableCell>
//                 <TableCell>Cantidad a trasladar</TableCell>
//                 <TableCell>Ventas en destino</TableCell>
//                 <TableCell>Stock en destino</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {groupedBySucursal[suc].map((item, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{item.sucursalOrigen}</TableCell>
//                   <TableCell>{item.codigo}</TableCell>
//                   <TableCell>{item.producto}</TableCell>
//                   <TableCell>{item.vence}</TableCell>
//                   <TableCell>{item.cantidadTrasladar}</TableCell>
//                   <TableCell>{item.ventasDestino}</TableCell>
//                   <TableCell>{item.stockDestino}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       ))}
//     </Box>
//   );
// }

//ANDA BIEN (INCLUYE SOLICITUD DE PEDIDOS A SUCRUSALES)
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
//     const productsMap = {};

//     rows.forEach((r) => {
//       const codigo = (r["Código de Barra"] ?? "").toString().trim();
//       if (!codigo) return;

//       const producto = r["Producto"] ?? "";
//       const mes = (r["Mes"] ?? "").toString().trim();
//       const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
//       const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN").toString().trim();

//       if (sucursalOrigen === sucursalDestino) return;

//       const cantidad = parseNumber(r["Cantidad"]);
//       const ventas = parseNumber(r["Unidades vendidas en destino"]);
//       const stock = parseNumber(r["Stock"]);

//       const prodKey = `${codigo}||${mes}`;
//       if (!productsMap[prodKey]) {
//         productsMap[prodKey] = {
//           codigo,
//           producto,
//           mes,
//           origins: {},
//           destinations: {},
//         };
//       }

//       if (!productsMap[prodKey].origins[sucursalOrigen]) {
//         productsMap[prodKey].origins[sucursalOrigen] = cantidad;
//       }

//       if (!productsMap[prodKey].destinations[sucursalDestino]) {
//         productsMap[prodKey].destinations[sucursalDestino] = {
//           ventas,
//           stock,
//         };
//       }
//     });

//     const result = {};

//     Object.values(productsMap).forEach((prod) => {
//       const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
//         sucursalOrigen: origen,
//         cantidad: qty,
//       }));

//       const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
//         sucursalDestino: dest,
//         ventas: v.ventas,
//         stock: v.stock,
//       }));

//       const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
//       if (destinosValidos.length === 0) return;

//       destinosValidos.sort((a, b) => b.ventas - a.ventas);

//       let idxDestino = 0;
//       originsArr.forEach((origen) => {
//         if (origen.cantidad <= 0) return;

//         const destino = destinosValidos[idxDestino % destinosValidos.length];

//         if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
//         result[destino.sucursalDestino].push({
//           codigo: prod.codigo,
//           producto: prod.producto,
//           sucursalOrigen: origen.sucursalOrigen,
//           vence: prod.mes,
//           cantidadTrasladar: origen.cantidad,
//           ventasDestino: destino.ventas,
//           stockDestino: destino.stock,
//         });

//         idxDestino++;
//       });
//     });

//     🔄 Generamos el agrupado inverso (por origen)
//     const origenesResult = {};
//     Object.entries(result).forEach(([destino, items]) => {
//       items.forEach((item) => {
//         if (!origenesResult[item.sucursalOrigen]) origenesResult[item.sucursalOrigen] = [];
//         origenesResult[item.sucursalOrigen].push({
//           ...item,
//           sucursalDestino: destino,
//         });
//       });
//     });

//     setGroupedBySucursal(result);
//     setGroupedByOrigen(origenesResult);
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
//           <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mt: 3 }}>
//             <Tab label="Distribución por Destino" />
//             <Tab label="Pedidos por Origen" />
//           </Tabs>

//           {tab === 0 &&
//             Object.keys(groupedBySucursal).map((suc) => (
//               <Paper key={suc} sx={{ my: 3, p: 2 }}>
//                 <Typography variant="h6">{`Sucursal destino: ${suc}`}</Typography>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Sucursal Origen</TableCell>
//                       <TableCell>Código</TableCell>
//                       <TableCell>Producto</TableCell>
//                       <TableCell>Vence</TableCell>
//                       <TableCell>Cantidad a trasladar</TableCell>
//                       <TableCell>Ventas en destino</TableCell>
//                       <TableCell>Stock en destino</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {groupedBySucursal[suc].map((item, i) => (
//                       <TableRow key={i}>
//                         <TableCell>{item.sucursalOrigen}</TableCell>
//                         <TableCell>{item.codigo}</TableCell>
//                         <TableCell>{item.producto}</TableCell>
//                         <TableCell>{item.vence}</TableCell>
//                         <TableCell>{item.cantidadTrasladar}</TableCell>
//                         <TableCell>{item.ventasDestino}</TableCell>
//                         <TableCell>{item.stockDestino}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </Paper>
//             ))}

//           {tab === 1 &&
//             Object.keys(groupedByOrigen).map((origen) => (
//               <Paper key={origen} sx={{ my: 3, p: 2 }}>
//                 <Typography variant="h6">{`Sucursal origen: ${origen}`}</Typography>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Destino</TableCell>
//                       <TableCell>Código</TableCell>
//                       <TableCell>Producto</TableCell>
//                       <TableCell>Vence</TableCell>
//                       <TableCell>Cantidad</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {groupedByOrigen[origen].map((item, i) => (
//                       <TableRow key={i}>
//                         <TableCell>{item.sucursalDestino}</TableCell>
//                         <TableCell>{item.codigo}</TableCell>
//                         <TableCell>{item.producto}</TableCell>
//                         <TableCell>{item.vence}</TableCell>
//                         <TableCell>{item.cantidadTrasladar}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </Paper>
//             ))}
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

  //   rows.forEach((r) => {
  //     const codigo = (r["Código de Barra"] ?? "").toString().trim();
  //     if (!codigo) return;

  //     const producto = r["Producto"] ?? "";
  //     const mes = (r["Mes"] ?? "").toString().trim();
  //     const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
  //     const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN").toString().trim();

  //     if (sucursalOrigen === sucursalDestino) return;

  //     const cantidad = parseNumber(r["Cantidad"]);
  //     const ventas = parseNumber(r["Unidades vendidas en destino"]);
  //     const stock = parseNumber(r["Stock"]);

  //     const prodKey = `${codigo}||${mes}`;
  //     if (!productsMap[prodKey]) {
  //       productsMap[prodKey] = {
  //         codigo,
  //         producto,
  //         mes,
  //         origins: {},
  //         destinations: {},
  //       };
  //     }

  //     if (!productsMap[prodKey].origins[sucursalOrigen]) {
  //       productsMap[prodKey].origins[sucursalOrigen] = cantidad;
  //     }

  //     if (!productsMap[prodKey].destinations[sucursalDestino]) {
  //       productsMap[prodKey].destinations[sucursalDestino] = {
  //         ventas,
  //         stock,
  //       };
  //     }
  //   });

  //   const result = {};

  //   Object.values(productsMap).forEach((prod) => {
  //     const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
  //       sucursalOrigen: origen,
  //       cantidad: qty,
  //     }));

  //     const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
  //       sucursalDestino: dest,
  //       ventas: v.ventas,
  //       stock: v.stock,
  //     }));

  //     const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
  //     if (destinosValidos.length === 0) return;

  //     destinosValidos.sort((a, b) => b.ventas - a.ventas);

  //     let idxDestino = 0;
  //     originsArr.forEach((origen) => {
  //       if (origen.cantidad <= 0) return;

  //       const destino = destinosValidos[idxDestino % destinosValidos.length];

  //       if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
  //       result[destino.sucursalDestino].push({
  //         codigo: prod.codigo,
  //         producto: prod.producto,
  //         sucursalOrigen: origen.sucursalOrigen,
  //         vence: prod.mes,
  //         cantidadTrasladar: origen.cantidad,
  //         ventasDestino: destino.ventas,
  //         stockDestino: destino.stock,
  //       });

  //       idxDestino++;
  //     });
  //   });

  //   // Agrupado inverso (por origen)
  //   const origenesResult = {};
  //   Object.entries(result).forEach(([destino, items]) => {
  //     items.forEach((item) => {
  //       if (!origenesResult[item.sucursalOrigen]) origenesResult[item.sucursalOrigen] = [];
  //       origenesResult[item.sucursalOrigen].push({
  //         ...item,
  //         sucursalDestino: destino,
  //       });
  //     });
  //   });

  //   setGroupedBySucursal(result);
  //   setGroupedByOrigen(origenesResult);
  // };

  const assignProducts = (rows) => {
    const productsMap = {};

    rows.forEach((r) => {
      const codigo = (r["Código de Barra"] ?? "").toString().trim();
      if (!codigo) return;

      const producto = r["Producto"] ?? "";
      const mes = (r["Mes"] ?? "").toString().trim();
      const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN")
        .toString()
        .trim();
      const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN")
        .toString()
        .trim();

      const cantidad = parseNumber(r["Cantidad"]);
      const ventas = parseNumber(r["Unidades vendidas en destino"]);
      const stock = parseNumber(r["Stock"]);

      const prodKey = `${codigo}||${mes}`;
      if (!productsMap[prodKey]) {
        productsMap[prodKey] = {
          codigo,
          producto,
          mes,
          origins: {}, // como antes: origen -> cantidad (primer valor)
          destinations: {}, // como antes: destino -> { ventas, stock } (primer valor)
          ventasOrigin: {}, // NUEVO: acumulador de ventas cuando origen === destino
        };
      }

      const prod = productsMap[prodKey];

      if (sucursalOrigen === sucursalDestino) {
        // Esta fila indica ventas EN la misma sucursal (ventas en origen)
        prod.ventasOrigin[sucursalOrigen] =
          (prod.ventasOrigin[sucursalOrigen] || 0) + ventas;
        // No tocamos origins.cantidad ni destinations (conservamos comportamiento original)
      } else {
        // Comportamiento original: guardar cantidad del origen sólo si no existe aún
        if (!prod.origins[sucursalOrigen]) {
          prod.origins[sucursalOrigen] = cantidad;
        }
        // Comportamiento original: guardar ventas/stock del destino solo si no existe aún
        if (!prod.destinations[sucursalDestino]) {
          prod.destinations[sucursalDestino] = { ventas, stock };
        }
      }
    });

    const result = {};

    Object.values(productsMap).forEach((prod) => {
      const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
        sucursalOrigen: origen,
        cantidad: qty,
        ventasOrigen: prod.ventasOrigin[origen] || 0, // traemos las ventas en origen si existen
      }));

      const destinosArr = Object.entries(prod.destinations).map(
        ([dest, v]) => ({
          sucursalDestino: dest,
          ventas: v.ventas,
          stock: v.stock,
        })
      );

      const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
      if (destinosValidos.length === 0) return;

      destinosValidos.sort((a, b) => b.ventas - a.ventas);

      let idxDestino = 0;
      originsArr.forEach((origen) => {
        if (origen.cantidad <= 0) return;

        const destino = destinosValidos[idxDestino % destinosValidos.length];

        if (!result[destino.sucursalDestino])
          result[destino.sucursalDestino] = [];
        result[destino.sucursalDestino].push({
          codigo: prod.codigo,
          producto: prod.producto,
          sucursalOrigen: origen.sucursalOrigen,
          vence: prod.mes,
          cantidadTrasladar: origen.cantidad,
          ventasDestino: destino.ventas,
          stockDestino: destino.stock,
          ventasOrigen: origen.ventasOrigen, // lo pasamos para poder mostrar/exportar
        });

        idxDestino++;
      });
    });

    // Agrupado inverso (por origen)
    const origenesResult = {};
    Object.entries(result).forEach(([destino, items]) => {
      items.forEach((item) => {
        if (!origenesResult[item.sucursalOrigen])
          origenesResult[item.sucursalOrigen] = [];
        origenesResult[item.sucursalOrigen].push({
          ...item,
          sucursalDestino: destino,
        });
      });
    });

    setGroupedBySucursal(result);
    setGroupedByOrigen(origenesResult);
  };

 const exportToExcel = (data, isDestino) => {
  const wb = XLSX.utils.book_new();

  Object.keys(data).forEach((key) => {
    const cleanSheetName = key.substring(0, 31); // Excel no admite nombres >31 caracteres

    // 🔹 Agrego filas con títulos antes de los datos
    const titulo = isDestino
      ? [`Sucursal de Destino: ${key}`] // si el key representa la sucursal origen
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
        return {
          "Sucursal Destino (Ventas)": `${item.sucursalDestino} (${item.ventasDestino})`,
          Código: item.codigo,
          Producto: item.producto,
          Vence: item.vence,
          "Cantidad a preparar": item.cantidadTrasladar,
          "Ventas en origen": item.ventasOrigen,
          "Ventas en destino": item.ventasDestino,
        };
      }
    });

    // 🔹 Convertimos el objeto a sheet
    const dataSheet = XLSX.utils.json_to_sheet(rows, { origin: 1 });

    // 🔹 Creamos una hoja nueva con el título en la primera fila
    const ws = XLSX.utils.aoa_to_sheet([titulo]);
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A4" });

    // 🔹 Agregamos hoja al workbook
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
                        <TableCell>Ventas en origen</TableCell> {/* 👈 NUEVO */}
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
                          <TableCell>{item.ventasOrigen}</TableCell>{" "}
                          {/* 👈 NUEVO */}
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
                        <TableCell>Ventas en origen</TableCell> {/* 👈 NUEVO */}
                        <TableCell>Ventas en destino</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedByOrigen[origen].map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {item.sucursalDestino} ({item.ventasDestino})
                          </TableCell>
                          <TableCell>{item.codigo}</TableCell>
                          <TableCell>{item.producto}</TableCell>
                          <TableCell>{item.vence}</TableCell>
                          <TableCell>{item.cantidadTrasladar}</TableCell>
                          <TableCell>{item.ventasOrigen}</TableCell>{" "}
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
