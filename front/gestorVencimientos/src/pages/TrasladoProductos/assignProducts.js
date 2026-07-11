import { crearProductosMap } from "./crearProductosMap";
import { filtrarOrigenes } from "./filtrarOrigenes";
import { distribuirProductos } from "./distribuirProductos";
import { calcularAsignaciones } from "./calcularAsignaciones";
import { calcularNecesidadDestinos } from "./calcularNecesidadDestinos";

export const assignProducts = (rows) => {
  const productsMap = crearProductosMap(rows);

  const groupedBySucursal = {};
  const groupedByOrigen = {};

  const agregarOrigen = (origen, registro) => {
    if (!groupedByOrigen[origen]) {
      groupedByOrigen[origen] = [];
    }

    groupedByOrigen[origen].push(registro);
  };

  const crearRegistro = ({
    codigo,
    producto,
    precioPublico,
    origen,
    destino,
    vence,
    cantidad,
    ventasOrigen,
    ventasDestino,
    stockDestino,
    nota = "",
  }) => ({
    codigo,
    producto,
    precioPublico,
    sucursalOrigen: origen,
    sucursalDestino: destino,
    vence,
    cantidadTrasladar: cantidad,
    ventasOrigen,
    ventasDestino,
    stockDestino,
    nota,
  });

  Object.entries(productsMap).forEach(([codigo, prod]) => {
    const originsArr = Object.entries(prod.origins).map(([s, d]) => ({
      sucursal: s,
      cantidad: d.cantidad,
      mes: d.mes,
      ventasOrigen: prod.ventasOrigen[s] || 0,
    }));

  const destinosArr = Object.entries(prod.destinations).map(([s, d]) => ({
  sucursal: s,
  ventas: d.ventas,
  stockDestino: d.stockDestino,
  mes: d.mes,

  stockVencido: prod.origins[s]?.cantidad ?? 0,

  tieneVencidos: !!prod.origins[s],
}));

    // =====================================
    // No existen destinos posibles
    // =====================================

    if (destinosArr.length === 0) {
      originsArr.forEach((origen) => {
        agregarOrigen(
          origen.sucursal,
          crearRegistro({
            codigo,
            producto: prod.producto,
            precioPublico: prod.precioPublico,
            origen: origen.sucursal,
            destino: "",
            vence: origen.mes,
            cantidad: origen.cantidad,
            ventasOrigen: origen.ventasOrigen,
            ventasDestino: 0,
            stockDestino: 0,
            nota: "❌ No hay destinos potables disponibles",
          })
        );
      });

      return;
    }

    // =====================================
    // Orígenes que realmente conviene trasladar
    // =====================================

   const originsFiltrados = filtrarOrigenes(
    originsArr,
    destinosArr,
    // prod,
    // codigo,
    // agregarOrigen,
    // crearRegistro
);

    const totalDisponible = originsFiltrados.reduce(
      (s, o) => s + o.cantidad,
      0
    );

    if (totalDisponible === 0) return;

    // =====================================
    // Destinos ordenados por necesidad
    // =====================================

   const destinosFinales = destinosArr
  .map(calcularNecesidadDestinos)
  .filter((d) => d.necesidad > 0)
  .sort((a, b) => {
    // primero el que más necesita
    if (b.necesidad !== a.necesidad) {
      return b.necesidad - a.necesidad;
    }

    // desempate por ventas
    return b.ventas - a.ventas;
  });

    const asignaciones = calcularAsignaciones(
      destinosFinales,
      totalDisponible
    );

    distribuirProductos({
      asignaciones,
      originsFiltrados,
      contexto: {
        prod,
        codigo,
        groupedBySucursal,
        agregarOrigen,
        crearRegistro,
      },
    });

    // =====================================
    // La sucursal también posee unidades próximas a vencer
    // =====================================

    // Object.keys(prod.origins).forEach((origen) => {
    //   if (!prod.destinations[origen]) return;

    //   agregarOrigen(
    //     origen,
    //     crearRegistro({
    //       codigo,
    //       producto: prod.producto,
    //       precioPublico: prod.precioPublico,
    //       origen,
    //       destino: origen,
    //       vence: prod.origins[origen].mes,
    //       cantidad: 0,
    //       ventasOrigen: prod.ventasOrigen[origen] || 0,
    //       ventasDestino: prod.destinations[origen].ventas,
    //       stockDestino: prod.destinations[origen].stockDestino,
    //       nota:
    //         "⚠ Esta sucursal también posee unidades próximas a vencer.",
    //     })
    //   );
    // });
  });

  return {
    groupedBySucursal,
    groupedByOrigen,
  };
};