const VENTAS_MINIMAS_ROTACION = 6;
import { calcularMesesHastaVencimiento } from "./calcularMesesHastaVencimiento";

export const buildConflicts = (groupedBySucursal) => {
  const conflicts = [];

  // ======================================================
  // CONFLICTO 1
  // Varias sucursales envían al mismo destino
  // ======================================================

  const mapDuplicados = {};

  Object.entries(groupedBySucursal).forEach(([destino, items]) => {
    items.forEach((item) => {
      if (item.cantidadTrasladar <= 0) return;

      const key = `${item.codigo}|${destino}`;

      if (!mapDuplicados[key]) {
        mapDuplicados[key] = {
          tipo: "duplicado",
          key,
          codigo: item.codigo,
          producto: item.producto,
          destino,
          cantidadNecesaria: 0,
          movimientos: [],
        };
      }

      mapDuplicados[key].movimientos.push(item);
      mapDuplicados[key].cantidadNecesaria += item.cantidadOriginal;
    });
  });

  Object.values(mapDuplicados)
    .map((conflict) => ({
      ...conflict,
      movimientos: conflict.movimientos.filter((m) => m.cantidadTrasladar > 0),
    }))
    .filter((conflict) => conflict.movimientos.length > 1)
    .forEach((c) => conflicts.push(c));

  // ======================================================
  // CONFLICTO 2
  // El origen probablemente venda el producto antes del vencimiento
  // ======================================================

  Object.entries(groupedBySucursal).forEach(([destino, items]) => {
    items.forEach((item) => {
      if (item.cantidadTrasladar <= 0) return;

      const mesesRestantes = calcularMesesHastaVencimiento(item.vence);

      const ventasEsperadas = (item.ventasOrigen / 12) * mesesRestantes;

      if (ventasEsperadas >= item.cantidadTrasladar && item.ventasOrigen > VENTAS_MINIMAS_ROTACION) {
        conflicts.push({
          tipo: "rotacion",
          key: `rotacion-${item.codigo}-${item.sucursalOrigen}-${destino}`,
          codigo: item.codigo,
          producto: item.producto,
          destino,
          mesesRestantes,
          ventasEsperadas,
          movimientos: [item],
        });
      }
    });
  });

  return conflicts;
};
