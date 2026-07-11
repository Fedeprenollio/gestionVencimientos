
export function calcularAsignaciones(destinos, totalDisponible) {
  if (destinos.length === 0 || totalDisponible <= 0) {
    return [];
  }

  const asignaciones = destinos.map((d) => ({
    ...d,
    cantidad: 0,
    resto: 0,
  }));

  let disponible = totalDisponible;

  // ==========================================
  // PASO 1
  // Garantizar 1 unidad para cada destino
  // (si alcanza el stock)
  // ==========================================

  if (disponible >= asignaciones.length) {
    asignaciones.forEach((d) => {
      d.cantidad = 1;
      disponible--;
    });
  }

  if (disponible <= 0) {
    return asignaciones;
  }

  // ==========================================
  // PASO 2
  // Repartir el resto según las ventas
  // ==========================================

  const totalVentas = asignaciones.reduce(
    (s, d) => s + d.ventas,
    0
  );

  asignaciones.forEach((d) => {
    const exacto =
      (d.ventas / totalVentas) * disponible;

    const enteras = Math.floor(exacto);

    d.cantidad += enteras;
    d.resto = exacto - enteras;
  });

  let repartidas =
    asignaciones.reduce((s, d) => s + d.cantidad, 0);

  let restantes =
    totalDisponible - repartidas;

  // ==========================================
  // PASO 3
  // Las unidades sobrantes van al mayor resto
  // ==========================================

  asignaciones.sort((a, b) => {
    if (b.resto !== a.resto) {
      return b.resto - a.resto;
    }

    return b.ventas - a.ventas;
  });

  let i = 0;

  while (restantes > 0) {
    asignaciones[i].cantidad++;
    restantes--;

    i++;

    if (i >= asignaciones.length) {
      i = 0;
    }
  }

  return asignaciones;
}