// // prepareMovements.js

// export const prepareMovements = (groupedBySucursal) => {
//   Object.values(groupedBySucursal)
//     .flat()
//     .forEach((m) => {
//       m.id = crypto.randomUUID();
//       m.activo = true;
//     });
// };
export const prepareMovements = (groupedBySucursal) => {
  Object.values(groupedBySucursal)
    .flat()
    .forEach((m) => {
      m.id = crypto.randomUUID();
      m.activo = true;

      // guardar la cantidad propuesta originalmente
      m.cantidadOriginal = m.cantidadTrasladar;
    });
};