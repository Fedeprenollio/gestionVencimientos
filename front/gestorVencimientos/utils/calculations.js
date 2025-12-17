// calculations.js
import dayjs from "dayjs";

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



// helper para la fecha Excel
function convertirExcelDateToJSDate(excelDate) {
  const fechaBase = new Date(1899, 11, 30);
  return new Date(fechaBase.getTime() + excelDate * 86400000);
}

export function agruparVentas(movimientos) {
  console.log("Holita")
  const ventasPorProducto = {};
  const hoy = new Date();
  const unAnioAtras = new Date(hoy);
  unAnioAtras.setFullYear(hoy.getFullYear() - 1);
const quraId = 1015700016;

const existe = movimientos.some(m => m.IDProducto == quraId);
console.log("¿Existe Qura Plus en movimientos?", existe);

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
      // if (fecha >= unAnioAtras && fecha <= hoy) {
      ventasPorProducto[id] = (ventasPorProducto[id] || 0) + Math.abs(cantidad);
      // }
    }
     if (mov.IDProducto == 1015700016) {
  console.log("📦 Qura:", mov, "Fecha:", fecha, "Es venta:", esVenta);
}
  }

  return ventasPorProducto;
}

// export function calcularDSIPorProducto(stockList, ventasPorProducto) {
//   const resultado = [];
//   for (const item of stockList) {
//     const id = item.IDProducto;
//     const stockActual = parseFloat(item.Cantidad || 0);
//     const ventasAnuales = ventasPorProducto[id] || 0;

//     // ⛔️ Ignorar productos sin stock y sin ventas
//     if (stockActual === 0 && ventasAnuales === 0) continue;

//     const ventasDiarias = ventasAnuales / 365;

//     const dsi =
//       ventasDiarias > 0
//         ? stockActual / ventasDiarias
//         : stockActual > 0
//         ? Infinity
//         : 0;

//     resultado.push({
//       IDProducto: id,
//       producto: item.producto,
//       dsi: dsi,
//       stock: stockActual,
//       ventasAnuales,
//       codebar: item.Codebar, // ✅ agregar esto
//       precio: item.Precio ?? 0,
//       costo: item.costo ?? 0,
//     });
//   }

//   return resultado;
// }

export function calcularDSIPorProducto(
  stockList,
  ventasPorProducto,
  devolucionesPorVencimiento
) {
  const resultado = [];

  // Creamos un Set de IDs de productos con devoluciones
  const idsConDevolucion = new Set(
    devolucionesPorVencimiento.map((item) => String(item.IDProducto))
  );

  for (const item of stockList) {
    const id = String(item.IDProducto);
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
      dsi,
      stock: stockActual,
      ventasAnuales,
      codebar: item.Codebar,
      precio: item.Precio ?? 0,
      costo: item.costo ?? 0,
      tuvoDevolucionVencimiento: idsConDevolucion.has(id),
      fechaUltimoPrecio: excelDateToJSDate(item.FechaUltimoPrecio),
      laboratorio: item.Laboratorio,
      rubro: item.Rubro,
    });
  }

  return resultado;
}
function excelDateToJSDate(serial) {
  // Excel empieza el 1 de enero de 1900 como día 1
  const excelEpoch = new Date(1900, 0, 1);
  const days = serial - 1; // porque el día 1 en Excel es 1900-01-01
  excelEpoch.setDate(excelEpoch.getDate() + days);
  return excelEpoch;
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
        recepcionesPorProducto[id] =
          (recepcionesPorProducto[id] || 0) + Math.abs(cantidad);
      }
    }
  }

  return recepcionesPorProducto;
}

export function listarProductosRecibidos(recepcionesPorProducto, stock) {
  const normalizeId = (id) => String(id).trim();

  return Object.entries(recepcionesPorProducto)
    .map(([IDProducto, cantidad]) => {
      const productoEnStock = stock.find(
        (item) => normalizeId(item.IDProducto) === normalizeId(IDProducto)
      );

      if (!productoEnStock || !productoEnStock.producto) return null;

      return {
        IDProducto,
        cantidad,
        nombre: productoEnStock.producto,
        codebar: productoEnStock.Codebar || "",
      };
    })
    .filter(Boolean); // ✅ Elimina los `null`
}

export function calcularDevolucionesPorVencimiento(movimientos) {
  const devolucionesPorProducto = {};

  for (const mov of movimientos) {
    const id = mov.IDProducto;
    const cantidad = parseFloat(mov.Cantidad || 0);
    const operacion = mov.Operacion?.toLowerCase() || "";

    const esDevolucion =
      operacion.includes("baja de stock - vencido") ||
      operacion.includes("devolucion por vencimiento") ||
      operacion.includes("vence");

    if (esDevolucion && !isNaN(cantidad)) {
      devolucionesPorProducto[id] =
        (devolucionesPorProducto[id] || 0) + Math.abs(cantidad);
    }
  }

  return devolucionesPorProducto;
}

export function mapearDevolucionesConProductos(movimientos, productos) {
  const resumen = calcularDevolucionesPorVencimiento(movimientos);

  return Object.entries(resumen)
    .map(([id, cantidad]) => {
      const producto = productos.find(
        (p) => String(p.IDProducto) === String(id)
      );

      // Si no se encuentra el producto, omitimos esta devolución
      if (!producto) return null;

      const precioUnitario = producto.Precio || producto.Unitario || 0;
      const perdidaTotal = precioUnitario * cantidad;

      return {
        IDProducto: id,
        nombre: producto.producto || "(Sin nombre)",
        codebar: producto.Codebar || "-",
        cantidad,
        precioUnitario,
        perdidaTotal,
      };
    })
    .filter((item) => item !== null); // Eliminar los nulos del resultado
}

export function calcularProductosDeMovimientoLento(
  movimientos,
  stockData,
  mesesSinVenta = 6
) {
  const productosLentos = [];
  const hoy = new Date();
  const fechaCorte = new Date(hoy);
  fechaCorte.setMonth(hoy.getMonth() - mesesSinVenta);
  const ventasPorProducto = {};

  for (const mov of movimientos) {
    const id = String(mov.IDProducto).trim();
    const cantidad = parseFloat(mov.Cantidad || 0);
    const operacion = mov.Operacion;
    const fechaExcel = mov.Fecha;

    const fecha =
      typeof fechaExcel === "number"
        ? convertirExcelDateToJSDate(fechaExcel)
        : new Date(fechaExcel);
    const esVenta =
      typeof operacion === "string" &&
      operacion.toLowerCase().includes("facturacion") &&
      operacion.toLowerCase().includes("fv");

    if (esVenta && fecha <= hoy && fecha >= fechaCorte && !isNaN(cantidad)) {
      ventasPorProducto[id] = true;
    }
  }

  for (const producto of stockData) {
    const id = String(producto.IDProducto).trim();
    const stock = parseFloat(producto.Cantidad || producto.Stock || 0);

    if (!ventasPorProducto[id] && stock > 0) {
      productosLentos.push({
        IDProducto: id,
        nombre: producto.producto || "(Sin nombre)",
        rubro: producto.Rubro || producto.Categoria || "-",
        codebar: producto.Codebar || "-",
        stock,
        precio: parseFloat(producto.Precio || 0),
        valorTotal: stock * parseFloat(producto.Precio || 0),
      });
    }
  }

  return productosLentos;
}

export function detectarProductosQuePerdieronRotacion(movimientos, stockData) {
  const productos = {};
  const hoy = dayjs();
  const hace6Meses = hoy.subtract(6, "month");
  const hace12Meses = hoy.subtract(12, "month");

  for (const mov of movimientos) {
    const id = String(mov.IDProducto).trim();
    const cantidad = parseFloat(mov.Cantidad || 0);
    const fecha =
      typeof mov.Fecha === "number"
        ? convertirExcelDateToJSDate(mov.Fecha)
        : new Date(mov.Fecha);

    const operacion = mov.Operacion || "";
    const esVenta =
      typeof operacion === "string" &&
      operacion.toLowerCase().includes("facturacion") &&
      operacion.toLowerCase().includes("fv");

    if (!esVenta || isNaN(cantidad) || !fecha) continue;

    const fechaVenta = dayjs(fecha);

    if (!productos[id]) {
      productos[id] = { ventas12a6: 0, ventas0a6: 0 };
    }

    if (fechaVenta.isAfter(hace12Meses) && fechaVenta.isBefore(hace6Meses)) {
      productos[id].ventas12a6 += Math.abs(cantidad);
    } else if (fechaVenta.isAfter(hace6Meses)) {
      productos[id].ventas0a6 += Math.abs(cantidad);
    }
  }
  // Ahora filtramos los que perdieron rotación
  const resultado = [];

  for (const [id, data] of Object.entries(productos)) {
    if (data.ventas12a6 > 0 && data.ventas0a6 === 0) {
      const producto = stockData.find(
        (p) => String(p.IDProducto).trim() === id
      );

      if (producto) {
        const stock = parseFloat(producto.Cantidad || producto.Stock || 0);
        const precio = parseFloat(producto.Precio || 0);
        resultado.push({
          IDProducto: id,
          nombre: producto.producto || "(Sin nombre)",
          rubro: producto.Rubro || producto.Categoria || "-",
          codebar: producto.Codebar || "-",
          stock,
          precio,
          ventas12a6: data.ventas12a6,
          ventas0a6: data.ventas0a6,
          valorStock: stock * precio,
        });
      }
    }
  }

  return resultado;
}

// utils/merma.js

// export function calcularIndiceMermaMensual(movimientos) {
//   const ventasPorMes = {};
//   const devolucionesPorMes = {};

//   for (const mov of movimientos) {
//     const operacion = mov.Operacion?.toLowerCase() || "";
//     const total = parseFloat(mov.Total || 0);
//     if (isNaN(total)) continue;

//     const fecha =
//       typeof mov.Fecha === "number"
//         ? convertirExcelDateToJSDate(mov.Fecha)
//         : new Date(mov.Fecha);

//     if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;

//     const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

//     const esVenta =
//       operacion.includes("facturacion") &&
//       operacion.includes("fv");

//     const esDevolucionVencimiento =
//       operacion.includes("vencido") ||
//       operacion.includes("devolucion por vencimiento");

//     if (esVenta) {
//       ventasPorMes[mes] = (ventasPorMes[mes] || 0) + Math.abs(total);
//     } else if (esDevolucionVencimiento) {
//       devolucionesPorMes[mes] = (devolucionesPorMes[mes] || 0) + Math.abs(total);
//     }
//   }

//   const todosLosMeses = Array.from(
//     new Set([...Object.keys(ventasPorMes), ...Object.keys(devolucionesPorMes)])
//   ).sort();

//   return todosLosMeses.map((mes) => {
//     const ventas = ventasPorMes[mes] || 0;
//     const vencimientos = devolucionesPorMes[mes] || 0;
//     const total = ventas + vencimientos;
//     const indice = total > 0 ? parseFloat(((vencimientos / total) * 100).toFixed(2)) : 0;

//     return {
//       mes,
//       ventas,
//       vencimientos,
//       indiceMerma: indice,
//     };
//   });
// }

export function calcularIndiceMermaMensual(movimientos, stockData) {
  const ventasPorMes = {};
  const devolucionesPorMes = {};
  // Creamos un Set con los codebar de interés
  const codigosDeInteres = new Set(stockData?.map((p) => p.Codebar));

  for (const mov of movimientos) {
    // Filtrar solo los movimientos cuyo Codebar esté en stockData
    if (!codigosDeInteres.has(mov.Codebar)) continue;

    const operacion = mov.Operacion?.toLowerCase() || "";
    const total = parseFloat(mov.Total || 0);
    if (isNaN(total)) continue;

    const fecha =
      typeof mov.Fecha === "number"
        ? convertirExcelDateToJSDate(mov.Fecha)
        : new Date(mov.Fecha);

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;

    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const esVenta =
      operacion.includes("facturacion") && operacion.includes("fv");

    const esDevolucionVencimiento =
      operacion.includes("vencido") ||
      operacion.includes("devolucion por vencimiento") ||
      operacion.includes("vencer");

    if (esVenta) {
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + Math.abs(total);
    } else if (esDevolucionVencimiento) {
      devolucionesPorMes[mes] =
        (devolucionesPorMes[mes] || 0) + Math.abs(total);
    }
  }

  const todosLosMeses = Array.from(
    new Set([...Object.keys(ventasPorMes), ...Object.keys(devolucionesPorMes)])
  ).sort();

  return todosLosMeses.map((mes) => {
    const ventas = ventasPorMes[mes] || 0;
    const vencimientos = devolucionesPorMes[mes] || 0;
    const total = ventas;
    const indice =
      total > 0 ? parseFloat(((vencimientos / total) * 100).toFixed(2)) : 0;

    return {
      mes,
      ventas,
      vencimientos,
      indiceMerma: indice,
    };
  });
}

export function calcularVentasMensuales(movimientos, stockData) {
  const ventasPorMes = {};

  const codigosDeInteres = new Set(stockData?.map((p) => p.Codebar));

  for (const mov of movimientos) {
    if (!codigosDeInteres.has(mov.Codebar)) continue;

    const operacion = mov.Operacion?.toLowerCase() || "";
    const total = parseFloat(mov.Total || 0);
    if (isNaN(total)) continue;

    const fecha =
      typeof mov.Fecha === "number"
        ? convertirExcelDateToJSDate(mov.Fecha)
        : new Date(mov.Fecha);

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;

    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const esVenta =
      operacion.includes("facturacion") && operacion.includes("fv");

    if (esVenta) {
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + Math.abs(total);
    }
  }

  // Convertir el objeto a array ordenado por mes
  const resultado = Object.entries(ventasPorMes)
    .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
    .map(([mes, ventas]) => ({
      mes,
      ventas,
    }));

  return resultado;
}

export function calcularABCDSI(stockData, movimientos) {
  // 1️⃣ Ventas anuales por producto
  const ventasPorProducto = agruparVentas(movimientos);

  // 2️⃣ Calcular DSI por producto
  const dsiPorProducto = calcularDSIPorProducto(
    stockData,
    ventasPorProducto,
    []
  );

  // 3️⃣ Calcular valor anual para ABC
  const productosConValor = dsiPorProducto.map((item) => {
    const valorAnual = (item.ventasAnuales || 0) * (item.precio || 0);
    return {
      ...item,
      valorAnual,
    };
  });

  // 4️⃣ Ordenar por valor anual descendente
  productosConValor.sort((a, b) => b.valorAnual - a.valorAnual);

  // 5️⃣ Calcular % individual, % acumulado y categoría ABC
  const totalValor = productosConValor.reduce(
    (sum, p) => sum + p.valorAnual,
    0
  );
  let acumulado = 0;

  for (const p of productosConValor) {
    // % individual del producto sobre el total
    p.porcentajeIndividual =
      totalValor > 0 ? (p.valorAnual / totalValor) * 100 : 0;

    // % acumulado
    acumulado += p.valorAnual;
    p.porcentajeAcumulado = totalValor > 0 ? (acumulado / totalValor) * 100 : 0;

    // Categoría ABC
    if (p.porcentajeAcumulado <= 80) {
      p.categoriaABC = "A";
    } else if (p.porcentajeAcumulado <= 95) {
      p.categoriaABC = "B";
    } else {
      p.categoriaABC = "C";
    }
  }

  return productosConValor;
}

export function analizarStockEntreSucursales(
  sucursalesData,
  umbralBajo = 180,
  umbralAlto = 365
) {
  const resultado = {};

  for (const sucursal of sucursalesData) {
    const { sucursalId, stockData, movimientos } = sucursal;
    console.log("sucursalId", sucursalId);
    // 1️⃣ Ventas anuales
    const ventasPorProducto = agruparVentas(movimientos);

    // 2️⃣ DSI por producto
    const dsiPorProducto = calcularDSIPorProducto(
      stockData,
      ventasPorProducto,
      []
    );

    for (const p of dsiPorProducto) {
      // console.log(
      //   "Producto:",
      //   p.IDProducto,
      //   "Nombre:",
      //   p.producto,
      //   "Sucursal:",
      //   sucursalId,
      //   "DSI:",
      //   p.dsi
      // );
      if (!resultado[p.IDProducto]) {
        resultado[p.IDProducto] = {
          nombre: p.producto || "(sin nombre)",
          deficit: [],
          exceso: [],
          neutral: [],
        };
      }

      if (p.dsi < umbralBajo) {
        resultado[p.IDProducto].deficit.push({ sucursalId, dsi: p.dsi });
      } else if (p.dsi > umbralAlto) {
        resultado[p.IDProducto].exceso.push({ sucursalId, dsi: p.dsi });
      } else {
        resultado[p.IDProducto].neutral.push({ sucursalId, dsi: p.dsi });
      }
    }
  }
  console.log("EL RESULTADO", resultado)
  return resultado;
}
