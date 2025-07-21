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

export function agruparRecepcionesDesdeSucursales(movimientos) {
  const recepcionesPorProducto = {};

  for (const mov of movimientos) {
    const id = mov.IDProducto;
    const cantidad = parseFloat(mov.Cantidad || 0);
    const operacion = mov.Operacion;
     const codebar = mov.IDProducto;

    if (typeof operacion === "string") {
      const esRecepcion = /pedidos\s*recepcion/i.test(operacion);
      if (esRecepcion && !isNaN(cantidad)) {
        console.log("esRecepcion",esRecepcion)
        recepcionesPorProducto[id] =
          (recepcionesPorProducto[id] || 0) + Math.abs(cantidad);
      }
    }
  }

  return recepcionesPorProducto;
}

export function listarProductosRecibidos(recepcionesPorProducto, stock) {
  const normalizeId = (id) => String(id).trim();

  return Object.entries(recepcionesPorProducto).map(([IDProducto, cantidad]) => {
    const productoEnStock = stock.find(
      (item) => normalizeId(item.IDProducto) === normalizeId(IDProducto)
    );
    return {
      IDProducto,
      cantidad,
      nombre: productoEnStock ? productoEnStock.producto || "Desconocido" : "Desconocido",
      codebar: productoEnStock ? productoEnStock.Codebar || "" : "",
    };
  });
}


export function calcularDevolucionesPorVencimiento(movimientos) {
  const devolucionesPorProducto = {};

  for (const mov of movimientos) {
    const id = mov.IDProducto;
    const cantidad = parseFloat(mov.Cantidad || 0);
    const operacion = mov.Operacion?.toLowerCase() || "";

    const esDevolucion =
      operacion.includes("baja de stock - vencido") ||
      operacion.includes("devolucion por vencimiento");

    if (esDevolucion && !isNaN(cantidad)) {
      devolucionesPorProducto[id] =
        (devolucionesPorProducto[id] || 0) + Math.abs(cantidad);
    }
  }

  return devolucionesPorProducto;
}


// export function mapearDevolucionesConProductos(movimientos, productos) {
//   console.log("productos", productos);
//   const resumen = calcularDevolucionesPorVencimiento(movimientos);

//   return Object.entries(resumen).map(([id, cantidad]) => {
//    const producto = productos.find((p) => String(p.IDProducto) === String(id)) || {};

//     return {
//       IDProducto: id,
//       nombre: producto.producto || "(Sin nombre)", // <- Aquí el cambio
//       codebar: producto.Codebar || "-", // Asegurate de respetar mayúsculas/minúsculas
//       cantidad,
//     };
//   });
// }

export function mapearDevolucionesConProductos(movimientos, productos) {
  const resumen = calcularDevolucionesPorVencimiento(movimientos);

  return Object.entries(resumen).map(([id, cantidad]) => {
    const producto = productos.find((p) => String(p.IDProducto) === String(id)) || {};

    // Precio unitario: puede ser producto.Precio, producto.Unitario o 0 si no existe
    const precioUnitario = producto.Precio || producto.Unitario || 0;

    // Calcular pérdida total
    const perdidaTotal = precioUnitario * cantidad;

    return {
      IDProducto: id,
      nombre: producto.producto || "(Sin nombre)",
      codebar: producto.Codebar || "-",
      cantidad,
      precioUnitario,
      perdidaTotal,
    };
  });
}
