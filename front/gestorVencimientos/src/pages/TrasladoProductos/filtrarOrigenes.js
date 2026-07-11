// import { calcularMesesHastaVencimiento } from "./calcularMesesHastaVencimiento";

// export function filtrarOrigenes(
//   originsArr,
//   destinosArr,
//   prod,
//   codigo,
//   agregarOrigen,
//   crearRegistro
// ) {
//   const resultado = [];

//   const mejorVentaDestino = Math.max(
//     ...destinosArr.map((d) => d.ventas),
//     0
//   );

//   originsArr.forEach((origen) => {
//     const mesesRestantes =
//       calcularMesesHastaVencimiento(origen.mes);

//     const ventasEsperadas =
//       (origen.ventasOrigen / 12) * mesesRestantes;

//     const vendeAntesDeVencer =
//       ventasEsperadas >= origen.cantidad;

//     const existeDestinoMuchoMejor =
//       mejorVentaDestino >= origen.ventasOrigen * 2;

//     // ===============================
//     // Decisión del algoritmo
//     // ===============================

//     let recomendadoMover = false;
//     let nota = "";

//     if (!vendeAntesDeVencer) {
//       // No llega a venderlo
//       recomendadoMover = true;
//     } else if (existeDestinoMuchoMejor) {
//       // Lo vendería, pero hay un destino mucho mejor
//       recomendadoMover = true;

//       nota =
//         `ℹ Se estima que venderá ${ventasEsperadas.toFixed(
//           1
//         )} unidades antes del vencimiento, pero existe una sucursal con una rotación significativamente mayor.`;
//     } else {
//       // Conviene dejarlo en origen
//       recomendadoMover = false;

//       nota =
//         `✔ Se estima que venderá ${ventasEsperadas.toFixed(
//           1
//         )} unidades antes del vencimiento.`;
//     }

//     // Sólo agregamos un registro cuando hay un mensaje
//     if (nota) {
//       agregarOrigen(
//         origen.sucursal,
//         crearRegistro({
//           codigo,
//           producto: prod.producto,
//           precioPublico: prod.precioPublico,
//           origen: origen.sucursal,
//           destino: "",
//           vence: origen.mes,
//           cantidad: 0,
//           ventasOrigen: origen.ventasOrigen,
//           ventasDestino: 0,
//           stockDestino: 0,
//           nota,
//         })
//       );
//     }

//     resultado.push({
//       ...origen,
//       mesesRestantes,
//       ventasEsperadas,
//       vendeAntesDeVencer,
//       existeDestinoMuchoMejor,
//       recomendadoMover,
//     });
//   });

//   return resultado;
// }

import { calcularMesesHastaVencimiento } from "./calcularMesesHastaVencimiento";

export function filtrarOrigenes(
  originsArr,
  destinosArr
) {
  const resultado = [];

  const mejorVentaDestino = Math.max(
    ...destinosArr.map((d) => d.ventas),
    0
  );

  originsArr.forEach((origen) => {
    const mesesRestantes =
      calcularMesesHastaVencimiento(origen.mes);

    const ventasEsperadas =
      (origen.ventasOrigen / 12) * mesesRestantes;

    const vendeAntesDeVencer =
      ventasEsperadas >= origen.cantidad;

    const existeDestinoMuchoMejor =
      mejorVentaDestino >= origen.ventasOrigen * 2;

    let recomendadoMover = false;
    let nota = "";

    if (!vendeAntesDeVencer) {
      // No llega a vender todo antes del vencimiento.
      recomendadoMover = true;
    } else if (existeDestinoMuchoMejor) {
      // Lo vendería, pero existe un destino claramente mejor.
      recomendadoMover = true;

      nota =
        `ℹ Se estima que venderá ${ventasEsperadas.toFixed(
          1
        )} unidades antes del vencimiento, pero existe una sucursal con una rotación significativamente mayor.`;
    } else {
      // Conviene dejarlo en origen.
      recomendadoMover = false;

      nota =
        `✔ Se estima que venderá ${ventasEsperadas.toFixed(
          1
        )} unidades antes del vencimiento.`;
    }

    resultado.push({
      ...origen,
      mesesRestantes,
      ventasEsperadas,
      vendeAntesDeVencer,
      existeDestinoMuchoMejor,
      recomendadoMover,
      nota,

      // Esta bandera la usaremos luego
      fueUtilizado: false,
    });
  });

  return resultado;
}