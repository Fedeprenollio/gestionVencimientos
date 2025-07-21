// calculations.js

export function calculateDSI(movements, stockData) {
  const diasAnuales = 365;

  let totalDSI = 0;
  let productosValidos = 0;

  for (const producto of stockData) {
    const cod = producto["Código"] || producto["Codigo"] || producto["ID"];
    const stockActual = parseFloat(producto["Stock"]);

    const ventasProducto = movements.filter(
      (mov) => mov["Código"] === cod && mov["Tipo"] === "Venta"
    );

    const totalVendido = ventasProducto.reduce(
      (sum, v) => sum + parseFloat(v["Cantidad"] || 0),
      0
    );

    const ventaDiaria = totalVendido / diasAnuales;

    if (ventaDiaria > 0) {
      const dsi = stockActual / ventaDiaria;
      totalDSI += dsi;
      productosValidos++;
    }
  }

  const promedio = productosValidos > 0 ? totalDSI / productosValidos : 0;

  return { promedio, productos: productosValidos };
}

// utils/calculations.js

const esVenta = (operacion) =>
  typeof operacion === "string" &&
  operacion.toLowerCase().startsWith("Facturacion FV");

export function agruparVentas(movimientos) {
  const ventasPorProducto = {};
  const hoy = new Date();
  const unAnioAtras = new Date(hoy);
  unAnioAtras.setFullYear(hoy.getFullYear() - 1);

  for (const mov of movimientos) {
    const id = mov.IDProducto;
    const cantidad = parseFloat(mov.Cantidad || 0);
    const operacion = mov.Operacion;
    const fechaExcel = mov.Fecha;

    // ✅ Convertir número Excel a Date
    const fecha =
      typeof fechaExcel === "number"
        ? convertirExcelDateToJSDate(fechaExcel)
        : new Date(fechaExcel);

    if (isNaN(fecha.getTime())) continue;

    const esVenta =
      typeof operacion === "string" &&
      operacion.toLowerCase().includes("facturacion") &&
      operacion.toLowerCase().includes("fv");

    if (esVenta && !isNaN(cantidad)) {
      if (fecha >= unAnioAtras && fecha <= hoy) {
        ventasPorProducto[id] =
          (ventasPorProducto[id] || 0) + Math.abs(cantidad);
      }
    }
  }

  return ventasPorProducto;
}

// helper para la fecha Excel
function convertirExcelDateToJSDate(excelDate) {
  const fechaBase = new Date(1899, 11, 30);
  return new Date(fechaBase.getTime() + excelDate * 86400000);
}



export function calcularDSIPorProducto(stockList, ventasPorProducto) {
  const resultado = [];
  for (const item of stockList) {
    const id = item.IDProducto;
    const stockActual = parseFloat(item.Cantidad || 0);
    const ventasAnuales = ventasPorProducto[id] || 0;

    // ⛔️ Ignorar productos sin stock y sin ventas
    if (stockActual === 0 && ventasAnuales === 0) continue;

    const ventasDiarias = ventasAnuales / 365;

    const dsi =
      ventasDiarias > 0
        ? stockActual / ventasDiarias
        : stockActual > 0
        ? Infinity
        : 0;

    resultado.push({
      IDProducto: id,
      producto: item.producto,
      dsi: dsi,
      stock: stockActual,
      ventasAnuales,
      codebar: item.Codebar, // ✅ agregar esto
      precio: item.Precio ?? 0,
      costo: item.costo ?? 0,
    });
  }

  return resultado;
}
