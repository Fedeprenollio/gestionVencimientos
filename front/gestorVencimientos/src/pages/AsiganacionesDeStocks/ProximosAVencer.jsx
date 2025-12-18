
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

//     // Destinos válidos
//     const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
//       sucursal: s,
//       ventas: d.ventas,
//       stockDestino: d.stockDestino,
//       mes: d.mes,
//       tieneVencidos: !!prod.origins[s],
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

//     const totalDisponible = originsArr.reduce((s, o) => s + o.cantidad, 0);

//     // 🔹 Separar destinos limpios y con stock por vencer
//     let destinosLimpios = destinosArr.filter(d => !d.tieneVencidos);
//     let destinosConVencidos = destinosArr.filter(d => d.tieneVencidos);

//     let destinosFinales = destinosLimpios.length > 0 ? destinosLimpios : destinosArr;

//     // Paso 2: total de ventas para distribución proporcional
//     const totalVentas = destinosFinales.reduce((s, d) => s + d.ventas, 0);
//     let asignaciones = destinosFinales.map((d) => ({
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
//           sucursalDestino: origenKey,
//           vence: prod.origins[origenKey].mes,
//           cantidadTrasladar: 0,
//           ventasOrigen: prod.ventasOrigen[origenKey] || 0,
//           ventasDestino: prod.destinations[origenKey].ventas || 0,
//           stockDestino: prod.destinations[origenKey].stockDestino || 0,
//           nota: "⚠ Optimizar reparto: esta sucursal recibe y también envía el mismo producto",
//           tipo: "advertencia",
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

;

// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos mapa de productos por código
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();

//     const sucursalOrigen = (r["Sucursal"] ?? "").toString().trim();
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

//     // Ventas en la sucursal origen
//     if (sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       if (cantidad > 0) {
//         prod.origins[sucursalOrigen] = {
//           cantidad,
//           mes,
//         };
//       }

//       if (sucursalDestino && ventas > 0) {
//         prod.destinations[sucursalDestino] = {
//           ventas,
//           stockDestino,
//           mes,
//         };
//       }
//     }
//   });

//   const result = {};
//   const origenesResult = {};

//   // 2️⃣ Procesar cada producto por código
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const producto = prod.producto;

//     const originsArr = Object.entries(prod.origins).map(([s, d]) => ({
//       sucursal: s,
//       cantidad: d.cantidad,
//       mes: d.mes,
//       ventasOrigen: prod.ventasOrigen[s] || 0,
//     }));

//     const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
//       sucursal: s,
//       ventasDestino: d.ventas,
//       stockDestino: d.stockDestino,
//       mes: d.mes,
//     }));

//     // 🔥 Cada ORIGEN decide sus propios destinos potables
//     originsArr.forEach((origen) => {
//       const { sucursal: sucOrigen, ventasOrigen, cantidad, mes } = origen;

//       // ⭐⭐⭐ AGREGADO IMPORTANTE ⭐⭐⭐
//       // 📌 Filtro de destinos potables → ventas mayores que origen + mínimo 5 anuales
//       const destinosPotables = destinosArr.filter(
//         (d) => d.ventasDestino > ventasOrigen && d.ventasDestino >= 5
//       );

//       // 2️⃣ Si no hay destinos potables → no mover
//       if (destinosPotables.length === 0) {
//         if (!origenesResult[sucOrigen]) origenesResult[sucOrigen] = [];
//         origenesResult[sucOrigen].push({
//           codigo,
//           producto,
//           sucursalOrigen: sucOrigen,
//           sucursalDestino: "",
//           vence: mes,
//           cantidadTrasladar: cantidad,
//           ventasOrigen,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "❌ No hay destinos potables (venden menos o menos de 5 ventas/año)",
//         });
//         return;
//       }

//       // 3️⃣ Un solo destino potable
//       if (destinosPotables.length === 1) {
//         const dest = destinosPotables[0];

//         if (!result[dest.sucursal]) result[dest.sucursal] = [];
//         if (!origenesResult[sucOrigen]) origenesResult[sucOrigen] = [];

//         const registro = {
//           codigo,
//           producto,
//           sucursalOrigen: sucOrigen,
//           sucursalDestino: dest.sucursal,
//           vence: mes,
//           cantidadTrasladar: cantidad,
//           ventasOrigen,
//           ventasDestino: dest.ventasDestino,
//           stockDestino: dest.stockDestino,
//           nota: "",
//         };

//         result[dest.sucursal].push(registro);
//         origenesResult[sucOrigen].push(registro);
//         return;
//       }

//       // 4️⃣ Varios destinos potables → distribución proporcional
//       const totalVentas = destinosPotables.reduce(
//         (s, d) => s + d.ventasDestino,
//         0
//       );

//       let asignaciones = destinosPotables.map((d) => ({
//         ...d,
//         cantidad: Math.floor((cantidad * d.ventasDestino) / totalVentas),
//       }));

//       // Ajuste por redondeo
//       let totalAsignado = asignaciones.reduce((s, a) => s + a.cantidad, 0);
//       let remanente = cantidad - totalAsignado;
//       let i = 0;

//       while (remanente > 0) {
//         asignaciones[i % asignaciones.length].cantidad += 1;
//         remanente--;
//         i++;
//       }

//       // Registrar asignaciones
//       asignaciones.forEach((dest) => {
//         if (dest.cantidad <= 0) return;

//         if (!result[dest.sucursal]) result[dest.sucursal] = [];
//         if (!origenesResult[sucOrigen]) origenesResult[sucOrigen] = [];

//         const registro = {
//           codigo,
//           producto,
//           sucursalOrigen: sucOrigen,
//           sucursalDestino: dest.sucursal,
//           vence: mes,
//           cantidadTrasladar: dest.cantidad,
//           ventasOrigen,
//           ventasDestino: dest.ventasDestino,
//           stockDestino: dest.stockDestino,
//           nota: "",
//         };

//         result[dest.sucursal].push(registro);
//         origenesResult[sucOrigen].push(registro);
//       });
//     });
//   });

//   setGroupedBySucursal(result);
//   setGroupedByOrigen(origenesResult);
// };

// const assignProducts = (rows) => {
//   const productsMap = {};

//   // 1️⃣ Armamos mapa de productos por código (corrigiendo acumulaciones)
//   rows.forEach((r) => {
//     const codigo = (r["Código de Barra"] ?? r["CodigosBarra"] ?? "").toString().trim();
//     if (!codigo) return;

//     const producto = r["Producto"] ?? r["Descripción del producto"] ?? "";
//     const mes = (r["Mes"] ?? "").toString().trim();

//     const sucursalOrigen = (r["Sucursal"] ?? "").toString().trim();
//     const sucursalDestino = (r["Sucursal de destino"] ?? r["Sucursal destino"] ?? "").toString().trim();

//     const cantidad = Number(r["Cantidad"]) || 0;
//     const ventas = Number(r["Unidades vendidas en destino"] ?? r["venta anual"] ?? 0) || 0;
//     const stockDestino = Number(r["Stock en destino"] ?? 0) || 0;

//     if (!productsMap[codigo]) {
//       productsMap[codigo] = {
//         producto,
//         origins: {},      // { sucursal: { cantidad, mes } }
//         destinations: {}, // { sucursal: { ventas, stockDestino, mes } }
//         ventasOrigen: {}, // { sucursal: ventas }
//       };
//     }

//     const prod = productsMap[codigo];

//     // Si la fila representa ventas en la misma sucursal (origen == destino)
//     if (sucursalOrigen && sucursalOrigen === sucursalDestino) {
//       prod.ventasOrigen[sucursalOrigen] =
//         (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
//     } else {
//       // Origen con cantidad a trasladar (sumamos cantidades si hay múltiples filas)
//       if (sucursalOrigen && cantidad > 0) {
//         prod.origins[sucursalOrigen] = prod.origins[sucursalOrigen] || { cantidad: 0, mes };
//         prod.origins[sucursalOrigen].cantidad += cantidad;
//         prod.origins[sucursalOrigen].mes = prod.origins[sucursalOrigen].mes || mes;
//       }

//       // Destino: tomar el mayor valor observado de ventas (NO sumar)
//       if (sucursalDestino) {
//         prod.destinations[sucursalDestino] = prod.destinations[sucursalDestino] || {
//           ventas: 0,
//           stockDestino: 0,
//           mes,
//         };
//         prod.destinations[sucursalDestino].ventas = Math.max(
//           prod.destinations[sucursalDestino].ventas || 0,
//           ventas
//         );
//         prod.destinations[sucursalDestino].stockDestino = Math.max(
//           prod.destinations[sucursalDestino].stockDestino || 0,
//           stockDestino
//         );
//         prod.destinations[sucursalDestino].mes = prod.destinations[sucursalDestino].mes || mes;
//       }
//     }
//   });

//   const result = {}; // agrupado por destino
//   const origenesResult = {}; // agrupado por origen

//   // 2️⃣ Procesar producto por producto
//   Object.entries(productsMap).forEach(([codigo, prod]) => {
//     const producto = prod.producto;

//     // convertir objetos a arrays
//     const originsArr = Object.entries(prod.origins).map(([s, d]) => ({
//       sucursal: s,
//       cantidad: d.cantidad,
//       mes: d.mes,
//       ventasOrigen: prod.ventasOrigen[s] || 0,
//     }));

//     const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
//       sucursal: s,
//       ventasDestino: d.ventas,
//       stockDestino: d.stockDestino,
//       mes: d.mes,
//     }));

//     if (originsArr.length === 0) return; // nada que trasladar

//     // 2.A) Por cada origen, calcular sus destinos potables (ventas >=5 y > ventasOrigen)
//     const potableByOrigin = {};
//     originsArr.forEach((o) => {
//       potableByOrigin[o.sucursal] = destinosArr.filter(
//         (d) => d.ventasDestino >= 5 && d.ventasDestino > o.ventasOrigen
//       );
//     });

//     // 2.B) Unión de destinos potables (destinos que son potables para >=1 origen)
//     const unionDestMap = {};
//     Object.values(potableByOrigin).forEach((arr) =>
//       arr.forEach((d) => {
//         unionDestMap[d.sucursal] = d;
//       })
//     );
//     const unionDestinos = Object.values(unionDestMap);

//     // Si no hay destinos potables para nadie → dejar en origenesResult
//     if (unionDestinos.length === 0) {
//       originsArr.forEach((o) => {
//         if (!origenesResult[o.sucursal]) origenesResult[o.sucursal] = [];
//         origenesResult[o.sucursal].push({
//           codigo,
//           producto,
//           sucursalOrigen: o.sucursal,
//           sucursalDestino: "",
//           vence: o.mes,
//           cantidadTrasladar: o.cantidad,
//           ventasOrigen: o.ventasOrigen,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota: "❌ No hay destinos potables para ningún origen",
//         });
//       });
//       return;
//     }

//     // 3) Peso por destino = ventasDestino * countOrígenesQueLoConsideranPotable
//     const countByDestino = {};
//     originsArr.forEach((o) => {
//       potableByOrigin[o.sucursal].forEach((d) => {
//         countByDestino[d.sucursal] = (countByDestino[d.sucursal] || 0) + 1;
//       });
//     });

//     const destinosConPeso = unionDestinos.map((d) => ({
//       ...d,
//       countOrigenes: countByDestino[d.sucursal] || 1,
//       weight: d.ventasDestino * (countByDestino[d.sucursal] || 1),
//     }));

//     // 4) Repartir total de unidades del producto entre destinos según weight
//     const totalCantidad = originsArr.reduce((s, o) => s + o.cantidad, 0);
//     const totalWeight = destinosConPeso.reduce((s, d) => s + d.weight, 0) || 1;

//     let asignacionesGlobales = destinosConPeso.map((d) => ({
//       sucursal: d.sucursal,
//       ventasDestino: d.ventasDestino,
//       stockDestino: d.stockDestino,
//       cantidad: Math.floor((totalCantidad * d.weight) / totalWeight),
//     }));

//     // Ajuste remanente global (round-robin)
//     let asignadoSum = asignacionesGlobales.reduce((s, a) => s + a.cantidad, 0);
//     let remGlobal = totalCantidad - asignadoSum;
//     let idxGlobal = 0;
//     while (remGlobal > 0 && asignacionesGlobales.length > 0) {
//       asignacionesGlobales[idxGlobal % asignacionesGlobales.length].cantidad++;
//       remGlobal--;
//       idxGlobal++;
//     }

//     // 5) Para cada destino -> repartir su cantidad entre orígenes que lo consideran potable
//     asignacionesGlobales.forEach((dest) => {
//       if (dest.cantidad <= 0) return;

//       // Orígenes interesados en este destino
//       const origenesInteresados = originsArr.filter((o) =>
//         potableByOrigin[o.sucursal].some((d) => d.sucursal === dest.sucursal)
//       );

//       if (origenesInteresados.length === 0) {
//         // fallback improbable
//         if (!result[dest.sucursal]) result[dest.sucursal] = [];
//         result[dest.sucursal].push({
//           codigo,
//           producto,
//           sucursalOrigen: "VARIOS",
//           sucursalDestino: dest.sucursal,
//           vence: originsArr[0].mes,
//           cantidadTrasladar: dest.cantidad,
//           ventasOrigen: originsArr.reduce((a, o) => a + o.ventasOrigen, 0),
//           ventasDestino: dest.ventasDestino,
//           stockDestino: dest.stockDestino,
//           nota: "Reparto global (sin orígenes interesados)",
//         });
//         return;
//       }

//       // Repartir dest.cantidad entre esos orígenes según su cantidad disponible
//       const totalInteresCantidad = origenesInteresados.reduce((s, o) => s + o.cantidad, 0);

//       // Asignaciones por origen (floor)
//       let asignPorOrigen = origenesInteresados.map((o) => ({
//         origen: o.sucursal,
//         cantidad: Math.floor((dest.cantidad * o.cantidad) / totalInteresCantidad),
//         ventasOrigen: o.ventasOrigen,
//         mes: o.mes,
//       }));

//       // ajustar remanente local
//       let sumLocal = asignPorOrigen.reduce((s, a) => s + a.cantidad, 0);
//       let remLocal = dest.cantidad - sumLocal;
//       let j = 0;
//       while (remLocal > 0 && asignPorOrigen.length > 0) {
//         asignPorOrigen[j % asignPorOrigen.length].cantidad++;
//         remLocal--;
//         j++;
//       }

//       // Registrar cada sub-asignación (respetando origenesResult y result)
//       asignPorOrigen.forEach((a) => {
//         if (a.cantidad <= 0) return;

//         if (!result[dest.sucursal]) result[dest.sucursal] = [];
//         if (!origenesResult[a.origen]) origenesResult[a.origen] = [];

//         const registro = {
//           codigo,
//           producto,
//           sucursalOrigen: a.origen,
//           sucursalDestino: dest.sucursal,
//           vence: a.mes,
//           cantidadTrasladar: a.cantidad,
//           ventasOrigen: a.ventasOrigen,
//           ventasDestino: dest.ventasDestino,
//           stockDestino: dest.stockDestino,
//           nota: "Reparto global proporcional",
//         };

//         result[dest.sucursal].push(registro);
//         origenesResult[a.origen].push(registro);
//       });
//     });

//     // FIN del producto
//   });

//   // 6️⃣ Detección de conflictos (varios orígenes -> mismo destino)
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
    // const mes = (r["Mes"] ?? "").toString().trim();
    const mes = parseExcelMonth(r["Mes"]);

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

    // Ventas origen
    if (sucursalOrigen === sucursalDestino) {
      prod.ventasOrigen[sucursalOrigen] =
        (prod.ventasOrigen[sucursalOrigen] || 0) + ventas;
    } else {
      if (cantidad > 0)
        prod.origins[sucursalOrigen] = { cantidad, mes };

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

    const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
      sucursal: s,
      ventas: d.ventas,
      stockDestino: d.stockDestino,
      mes: d.mes,
      tieneVencidos: !!prod.origins[s],
    }));

    // Sin destinos potables
    if (destinosArr.length === 0) {
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

    // 🔹 Clasificación de destinos
    let destinosLimpios = destinosArr.filter(d => !d.tieneVencidos);
    let destinosFinales = destinosLimpios.length > 0 ? destinosLimpios : destinosArr;

    // 🔥🔥🔥 FIX IMPORTANTE: ordenar destinos por mayor ventas
    destinosFinales.sort((a, b) => b.ventas - a.ventas);

    // 🔢 Distribución proporcional
    const totalVentas = destinosFinales.reduce((s, d) => s + d.ventas, 0);

    let asignaciones = destinosFinales.map((d) => ({
      ...d,
      cantidad: Math.floor((totalDisponible * d.ventas) / totalVentas),
    }));

    // Reparto del remanente (prioriza el de más ventas)
    let totalAsignado = asignaciones.reduce((s, a) => s + a.cantidad, 0);
    let remanente = totalDisponible - totalAsignado;
    let i = 0;

    while (remanente > 0 && asignaciones.length > 0) {
      asignaciones[i % asignaciones.length].cantidad++;
      remanente--;
      i++;
    }

    // 🚚 Distribución física origen → destino
    const colaOrigenes = [...originsArr];

    asignaciones.forEach((dest) => {
      let cantidadDestino = dest.cantidad;
      if (cantidadDestino <= 0) return;

      if (!result[dest.sucursal]) result[dest.sucursal] = [];

      while (cantidadDestino > 0 && colaOrigenes.length > 0) {
        const origen = colaOrigenes[0];
        const mover = Math.min(origen.cantidad, cantidadDestino);

        const notas = [];
        if (dest.tieneVencidos) notas.push("⚠ Destino ya tiene producto por vencer");

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

    // ⚠ Caso especial: origen que también es destino
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
        });
      }
    });
  });

  // 5️⃣ Detección de conflictos
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
      if (conflictMap[key] > 1)
        item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
    });
  });

  Object.entries(origenesResult).forEach(([origen, items]) => {
    items.forEach((item) => {
      const key = `${item.codigo}|${item.sucursalDestino}`;
      if (item.sucursalDestino && conflictMap[key] > 1)
        item.nota = (item.nota ? item.nota + "\n" : "") + "⚠ Probable problema: varias sucursales enviando";
    });
  });

  setGroupedBySucursal(result);
  setGroupedByOrigen(origenesResult);
};


const parseExcelMonth = (value) => {
  if (value == null || value === "") return "";

  // Caso 1: texto (ej: "Marzo", "Marzo 2026")
  if (typeof value === "string") return value.trim();

  // Caso 2: número de fecha Excel
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return value.toString();

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const mes = meses[date.m - 1];
    const anio = date.y;

    return mes && anio ? `${mes} ${anio}` : value.toString();
  }

  return value.toString();
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
          "Sucursal Destino": item.sucursalDestino
            ? `${item.sucursalDestino}`
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
