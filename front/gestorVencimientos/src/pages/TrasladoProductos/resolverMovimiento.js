export function cancelarTraslado(
  movimiento,
  motivo
) {
  movimiento.cantidadTrasladar = 0;

  movimiento.sucursalDestino = "";
  movimiento.ventasDestino = 0;
  movimiento.stockDestino = 0;

  movimiento.nota = motivo;
}