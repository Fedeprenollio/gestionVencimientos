export const buildConflicts = (groupedBySucursal) => {
  const map = {};

  Object.entries(groupedBySucursal).forEach(([destino, items]) => {
    items.forEach((item) => {
      const key = `${item.codigo}|${destino}`;

      if (!map[key]) {
        map[key] = {
          key,
          codigo: item.codigo,
          producto: item.producto,
          destino,

          // NUEVO
          cantidadNecesaria: 0,

          movimientos: [],
        };
      }

      map[key].movimientos.push({
        ...item,
        edicion: {
          cantidad: item.cantidadTrasladar,
        },

        // guardamos la cantidad propuesta por el algoritmo
        cantidadOriginal: item.cantidadTrasladar,
      });

      // sumamos cuánto necesita recibir el destino
      map[key].cantidadNecesaria += item.cantidadTrasladar;
    });
  });

  return Object.values(map).filter((c) => c.movimientos.length > 1);
};
