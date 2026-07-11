const meses = {
  ENERO: 0,
  FEBRERO: 1,
  MARZO: 2,
  ABRIL: 3,
  MAYO: 4,
  JUNIO: 5,
  JULIO: 6,
  AGOSTO: 7,
  SEPTIEMBRE: 8,
  OCTUBRE: 9,
  NOVIEMBRE: 10,
  DICIEMBRE: 11,
};

export function calcularMesesHastaVencimiento(nombreMes) {
  const hoy = new Date();

  const mesActual = hoy.getMonth();

  const mesVencimiento = meses[nombreMes?.toUpperCase()];

  if (mesVencimiento == null) return 0;

  let diferencia = mesVencimiento - mesActual;

  if (diferencia < 0) {
    diferencia += 12;
  }

  // Nunca devolver 0 porque todavía queda el mes de vencimiento
  return diferencia + 1;
}