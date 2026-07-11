//  import * as XLSX from "xlsx";
//  export const exportToExcel = (data, isDestino) => {
//     const wb = XLSX.utils.book_new();

//     Object.keys(data).forEach((key) => {
//       const cleanSheetName = key.substring(0, 31);
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
//             PVP: item.precioPublico ?? "",
//             "Cantidad a trasladar": item.cantidadTrasladar,
//             "Ventas en origen": item.ventasOrigen,
//             "Ventas en destino": item.ventasDestino,
//             "Stock en destino": item.stockDestino ?? 0,
//             Nota: item.nota ?? "",
//           };
//         } else {
//           return {
//             "Sucursal Destino": item.sucursalDestino
//               ? `${item.sucursalDestino}`
//               : "",
//             Código: item.codigo,
//             Producto: item.producto,
//             Vence: item.vence,
//             PVP: item.precioPublico ?? "",
//             "Cantidad a preparar": item.cantidadTrasladar,
//             "Ventas en origen": item.ventasOrigen,
//             "Ventas en destino": item.ventasDestino,
//             "Stock en destino": item.stockDestino ?? 0,
//             Nota: item.nota ?? "",
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

import * as XLSX from "xlsx";

export const exportToExcel = (data, isDestino) => {
  const wb = XLSX.utils.book_new();

  Object.keys(data).forEach((key) => {
    // Solo exportamos movimientos activos
    // const activos = data[key].filter((item) => item.activo);

 
    // // Si no hay movimientos, no crear la hoja
    // if (activos.length === 0) return;

    const movimientos = isDestino
  ? data[key].filter((item) => item.cantidadTrasladar > 0)
  : data[key];

// Si la hoja queda vacía, no crearla
if (movimientos.length === 0) return;

    const cleanSheetName = key.substring(0, 31);

    const titulo = isDestino
      ? [`Sucursal de Destino: ${key}`]
      : [`Sucursal de Origen: ${key}`];

    const rows = movimientos.map((item) => {
      if (isDestino) {
        return {
          "Sucursal Origen": item.sucursalOrigen,
          Código: item.codigo,
          Producto: item.producto,
          Vence: item.vence,
          PVP: item.precioPublico ?? "",
          "Cantidad a trasladar": item.cantidadTrasladar,
          "Ventas en origen": item.ventasOrigen,
          "Ventas en destino": item.ventasDestino,
          "Stock en destino": item.stockDestino ?? 0,
          Nota: item.nota ?? "",
        };
      }

      return {
        "Sucursal Destino": item.sucursalDestino || "",
        Código: item.codigo,
        Producto: item.producto,
        Vence: item.vence,
        PVP: item.precioPublico ?? "",
        "Cantidad a preparar": item.cantidadTrasladar,
        "Ventas en origen": item.ventasOrigen,
        "Ventas en destino": item.ventasDestino,
        "Stock en destino": item.stockDestino ?? 0,
        Nota: item.nota ?? "",
      };
    });

    const ws = XLSX.utils.aoa_to_sheet([titulo]);

    XLSX.utils.sheet_add_json(ws, rows, {
      origin: "A4",
    });

    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
  });

  XLSX.writeFile(
    wb,
    isDestino
      ? "Distribucion_por_Destino.xlsx"
      : "Pedidos_por_Origen.xlsx"
  );
};