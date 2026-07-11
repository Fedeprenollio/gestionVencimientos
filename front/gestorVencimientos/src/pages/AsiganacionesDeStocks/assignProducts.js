import { parseExcelMonth } from "./parseExcelMonth";

export const assignProducts = (rows) => {
    const productsMap = {};

    // 1️⃣ Armamos el mapa de productos
    rows.forEach((r) => {
      const codigo = (r["Código de Barra"] ?? "").toString().trim();
      if (!codigo) return;

      const producto = r["Producto"] ?? "";
      // const mes = (r["Mes"] ?? "").toString().trim();
      const mes = parseExcelMonth(r["Mes"]);

      const sucursalOrigen = (r["Sucursal"] ?? "ORIGEN_UNKNOWN")
        .toString()
        .trim();
      const sucursalDestino = (r["Sucursal de destino"] ?? "")
        .toString()
        .trim();
      const cantidad = Number(r["Cantidad"]) || 0;
      const ventas = Number(r["Unidades vendidas en destino"]) || 0;
      const stockDestino = Number(r["Stock en destino"]) || 0;
      const precioPublico =
        r["PrecioPublico"] != null && r["PrecioPublico"] !== ""
          ? Number(r["PrecioPublico"])
          : null;

      if (!productsMap[codigo]) {
        productsMap[codigo] = {
          producto,
          precioPublico, // 👈 NUEVO
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
        precioPublico: prod.precioPublico, // 👈 NUEVO
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
          if (!origenesResult[origen.sucursal])
            origenesResult[origen.sucursal] = [];
          origenesResult[origen.sucursal].push({
            codigo,
            producto,
            precioPublico: prod.precioPublico, // 👈 FALTA ESTO
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
      let destinosLimpios = destinosArr.filter((d) => !d.tieneVencidos);
      let destinosFinales =
        destinosLimpios.length > 0 ? destinosLimpios : destinosArr;

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
          if (dest.tieneVencidos)
            notas.push("⚠ Destino ya tiene producto por vencer");

          const registro = {
            codigo,
            producto,
            precioPublico: prod.precioPublico, // 👈 NUEVO
            sucursalOrigen: origen.sucursal,
            sucursalDestino: dest.sucursal,
            vence: origen.mes,
            cantidadTrasladar: mover,
            ventasOrigen: origen.ventasOrigen,
            ventasDestino: dest.ventas,
            stockDestino: dest.stockDestino,
            nota: notas.join("\n"),
          };

          if (!origenesResult[origen.sucursal])
            origenesResult[origen.sucursal] = [];
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
            precioPublico: prod.precioPublico, // 👈 NUEVO
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
          item.nota =
            (item.nota ? item.nota + "\n" : "") +
            "⚠ Probable problema: varias sucursales enviando";
      });
    });

    // Object.entries(origenesResult).forEach(([origen, items]) => {
    //   items.forEach((item) => {
    //     const key = `${item.codigo}|${item.sucursalDestino}`;
    //     if (item.sucursalDestino && conflictMap[key] > 1)
    //       item.nota =
    //         (item.nota ? item.nota + "\n" : "") +
    //         "⚠ Probable problema: varias sucursales enviando";
    //   });
    // });

  

    return {
  groupedBySucursal: result,
  groupedByOrigen: origenesResult,
};
  };
