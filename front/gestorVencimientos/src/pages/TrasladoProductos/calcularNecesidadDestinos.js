import { calcularMesesHastaVencimiento } from "./calcularMesesHastaVencimiento";

export function calcularNecesidadDestinos(destino) {
  const mesesRestantes = calcularMesesHastaVencimiento(destino.mes);

  const ventasMensuales = destino.ventas / 12;

  const ventasEsperadas = ventasMensuales * mesesRestantes;

  // Stock próximo a vencer que YA tiene el destino
  const stockVencido = destino.stockVencido ?? 0;

  // Cuántas unidades realmente podría absorber
  const necesidad = Math.max(
    0,
    ventasEsperadas - stockVencido
  );

  // Prioridad para repartir.
  // La venta es lo principal.
  // Tener stock vencido sólo resta prioridad.
  const prioridad = Math.max(
    0,
    destino.ventas - stockVencido
  );

  return {
    ...destino,
    mesesRestantes,
    ventasMensuales,
    ventasEsperadas,
    stockVencido,
    necesidad,
    prioridad,
  };
}