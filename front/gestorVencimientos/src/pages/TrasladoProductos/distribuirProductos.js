// export function distribuirProductos({
//   asignaciones,
//   originsFiltrados,
//   contexto,
// }) {
//   const {
//     prod,
//     codigo,
//     groupedBySucursal,
//     agregarOrigen,
//     crearRegistro,
//   } = contexto;

//   // Copia mutable del stock disponible
//   const stockDisponible = originsFiltrados.map((o) => ({ ...o }));

//   // ======================================================
//   // PASO 1
//   // Si una sucursal también es destino, conserva únicamente
//   // la cantidad que el algoritmo decidió asignarle.
//   // ======================================================

//   for (const destino of asignaciones) {
//     if (!destino.tieneVencidos) continue;

//     const origen = stockDisponible.find(
//       (o) => o.sucursal === destino.sucursal
//     );

//     if (!origen) continue;

//     const mover = Math.min(
//       origen.cantidad,
//       destino.cantidad
//     );

//     if (mover <= 0) continue;

//     if (!groupedBySucursal[destino.sucursal]) {
//       groupedBySucursal[destino.sucursal] = [];
//     }

//     const registro = crearRegistro({
//       codigo,
//       producto: prod.producto,
//       precioPublico: prod.precioPublico,
//       origen: origen.sucursal,
//       destino: destino.sucursal,
//       vence: origen.mes,
//       cantidad: mover,
//       ventasOrigen: origen.ventasOrigen,
//       ventasDestino: destino.ventas,
//       stockDestino: destino.stockDestino,
//       nota: "⚠ La sucursal también posee unidades próximas a vencer.",
//     });

//     groupedBySucursal[destino.sucursal].push(registro);
//     agregarOrigen(origen.sucursal, registro);

//     origen.cantidad -= mover;
//     destino.cantidad -= mover;
//   }

//   // ======================================================
//   // PASO 2
//   // Repartimos el resto de las unidades.
//   // ======================================================

//   asignaciones.forEach((destino) => {
//     let pendiente = destino.cantidad;

//     if (pendiente <= 0) return;

//     if (!groupedBySucursal[destino.sucursal]) {
//       groupedBySucursal[destino.sucursal] = [];
//     }

//     const origenesOrdenados = [...stockDisponible].sort((a, b) => {
//       // Primero los que conviene mover
//       if (a.recomendadoMover !== b.recomendadoMover) {
//         return Number(b.recomendadoMover) - Number(a.recomendadoMover);
//       }

//       // Luego el que menos vende
//       if (a.ventasOrigen !== b.ventasOrigen) {
//         return a.ventasOrigen - b.ventasOrigen;
//       }

//       return 0;
//     });

//     for (const origen of origenesOrdenados) {
//   if (pendiente <= 0) break;
//   if (origen.cantidad <= 0) continue;

//   // No enviar a una sucursal que vende menos
//   // if (origen.ventasOrigen > destino.ventas) continue;
//   // Si el origen ya tiene una buena rotación, no mover
// if (origen.ventasOrigen >= 7) continue;

// // El destino debe vender al menos un 50% más
// if (destino.ventas < origen.ventasOrigen * 1.6) continue;

//   // Si se estima que venderá antes del vencimiento, no mover
// // if (origen.vendeAntesDeVencer) continue;

//       const mover = Math.min(
//         origen.cantidad,
//         pendiente
//       );

//       const registro = crearRegistro({
//         codigo,
//         producto: prod.producto,
//         precioPublico: prod.precioPublico,
//         origen: origen.sucursal,
//         destino: destino.sucursal,
//         vence: origen.mes,
//         cantidad: mover,
//         ventasOrigen: origen.ventasOrigen,
//         ventasDestino: destino.ventas,
//         stockDestino: destino.stockDestino,
//         nota: destino.tieneVencidos
//           ? "⚠ Este destino también posee unidades próximas a vencer."
//           : "",
//       });

//       groupedBySucursal[destino.sucursal].push(registro);
//       agregarOrigen(origen.sucursal, registro);

//       origen.cantidad -= mover;
//       pendiente -= mover;
//     }
//   });
// }

export function distribuirProductos({
  asignaciones,
  originsFiltrados,
  contexto,
}) {
  const {
    prod,
    codigo,
    groupedBySucursal,
    agregarOrigen,
    crearRegistro,
  } = contexto;

  // Copia del stock disponible
  const stockDisponible = originsFiltrados.map((o) => ({ ...o }));

  // ======================================================
  // PASO 1
  // Si una sucursal también es destino,
  // primero intenta quedarse con las unidades
  // que el algoritmo le asignó.
  // ======================================================

  for (const destino of asignaciones) {
    if (!destino.tieneVencidos) continue;

    const origen = stockDisponible.find(
      (o) => o.sucursal === destino.sucursal
    );

    if (!origen) continue;

    const mantener = Math.min(
      origen.cantidad,
      destino.cantidad
    );

    if (mantener <= 0) continue;

    if (!groupedBySucursal[destino.sucursal]) {
      groupedBySucursal[destino.sucursal] = [];
    }

    const registro = crearRegistro({
      codigo,
      producto: prod.producto,
      precioPublico: prod.precioPublico,
      origen: origen.sucursal,
      destino: destino.sucursal,
      vence: origen.mes,
      cantidad: mantener,
      ventasOrigen: origen.ventasOrigen,
      ventasDestino: destino.ventas,
      stockDestino: destino.stockDestino,
      nota: "⚠ La sucursal también posee unidades próximas a vencer.",
    });

    groupedBySucursal[destino.sucursal].push(registro);
    agregarOrigen(origen.sucursal, registro);

    origen.cantidad -= mantener;
    destino.cantidad -= mantener;
  }

  // ======================================================
  // PASO 2
  // Repartimos el resto.
  // Los orígenes recomendados para mover
  // tienen prioridad.
  // ======================================================

  asignaciones.forEach((destino) => {
    let pendiente = destino.cantidad;

    if (pendiente <= 0) return;

    if (!groupedBySucursal[destino.sucursal]) {
      groupedBySucursal[destino.sucursal] = [];
    }

    const origenesOrdenados = [...stockDisponible].sort((a, b) => {

      // primero los recomendados para mover
      if (a.recomendadoMover !== b.recomendadoMover) {
        return Number(b.recomendadoMover) - Number(a.recomendadoMover);
      }

      // luego menor venta
      if (a.ventasOrigen !== b.ventasOrigen) {
        return a.ventasOrigen - b.ventasOrigen;
      }

      return 0;
    });

    for (const origen of origenesOrdenados) {

      if (pendiente <= 0) break;
      if (origen.cantidad <= 0) continue;

      const mover = Math.min(
        origen.cantidad,
        pendiente
      );

      const registro = crearRegistro({
        codigo,
        producto: prod.producto,
        precioPublico: prod.precioPublico,
        origen: origen.sucursal,
        destino: destino.sucursal,
        vence: origen.mes,
        cantidad: mover,
        ventasOrigen: origen.ventasOrigen,
        ventasDestino: destino.ventas,
        stockDestino: destino.stockDestino,
        nota: destino.tieneVencidos
          ? "⚠ Este destino también posee unidades próximas a vencer."
          : "",
      });

      groupedBySucursal[destino.sucursal].push(registro);
      agregarOrigen(origen.sucursal, registro);

      origen.cantidad -= mover;
      pendiente -= mover;
    }
  });
}