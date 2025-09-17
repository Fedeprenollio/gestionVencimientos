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
} from "@mui/material";

export default function TrasladoProductos() {
  const [groupedBySucursal, setGroupedBySucursal] = useState({});

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

  const assignProducts = (rows) => {
    const productsMap = {};

    rows.forEach((r) => {
      const codigo = (r["Código de Barra"] ?? "").toString().trim();
      if (!codigo) return;

      const producto = r["Producto"] ?? "";
      const mes = (r["Mes"] ?? "").toString().trim();
      const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN").toString().trim();
      const sucursalDestino = (r["Sucursal de destino"] ?? "DESTINO_UNKNOWN").toString().trim();

      if (sucursalOrigen === sucursalDestino) return; // ❌ evitar traslado origen=destino

      const cantidad = parseNumber(r["Cantidad"]);
      const ventas = parseNumber(r["Unidades vendidas en destino"]);
      const stock = parseNumber(r["Stock"]);

      const prodKey = `${codigo}||${mes}`;
      if (!productsMap[prodKey]) {
        productsMap[prodKey] = {
          codigo,
          producto,
          mes,
          origins: {}, // origen -> cantidad (UNICA)
          destinations: {}, // destino -> { ventas, stock }
        };
      }

      // ✅ Solo sumamos una vez por origen
      if (!productsMap[prodKey].origins[sucursalOrigen]) {
        productsMap[prodKey].origins[sucursalOrigen] = cantidad;
      }

      // ✅ Guardamos el mejor dato de ventas/stock por destino
      if (!productsMap[prodKey].destinations[sucursalDestino]) {
        productsMap[prodKey].destinations[sucursalDestino] = {
          ventas,
          stock,
        };
      }
    });

    const result = {};

    Object.values(productsMap).forEach((prod) => {
      const originsArr = Object.entries(prod.origins).map(([origen, qty]) => ({
        sucursalOrigen: origen,
        cantidad: qty,
      }));

      const destinosArr = Object.entries(prod.destinations).map(([dest, v]) => ({
        sucursalDestino: dest,
        ventas: v.ventas,
        stock: v.stock,
      }));

      const destinosValidos = destinosArr.filter((d) => d.ventas >= 5);
      if (destinosValidos.length === 0) return;

      destinosValidos.sort((a, b) => b.ventas - a.ventas);

      let idxDestino = 0;
      originsArr.forEach((origen) => {
        if (origen.cantidad <= 0) return;

        const destino = destinosValidos[idxDestino % destinosValidos.length];

        if (!result[destino.sucursalDestino]) result[destino.sucursalDestino] = [];
        result[destino.sucursalDestino].push({
          codigo: prod.codigo,
          producto: prod.producto,
          sucursalOrigen: origen.sucursalOrigen,
          vence: prod.mes,
          cantidadTrasladar: origen.cantidad, // ✅ ahora es la cantidad real (no sumada)
          ventasDestino: destino.ventas,
          stockDestino: destino.stock,
        });

        idxDestino++;
      });
    });

    setGroupedBySucursal(result);
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

      {Object.keys(groupedBySucursal).length === 0 && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Carga un archivo para ver el plan de traslado.
        </Typography>
      )}

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
                  <TableCell>{item.ventasDestino}</TableCell>
                  <TableCell>{item.stockDestino}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Box>
  );
}
