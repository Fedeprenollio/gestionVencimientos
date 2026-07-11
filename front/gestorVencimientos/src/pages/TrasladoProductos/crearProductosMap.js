import { parseExcelMonth } from "../AsiganacionesDeStocks/parseExcelMonth";

export function crearProductosMap(rows) {
  const productsMap = {};

  rows.forEach((r) => {
    const codigo = (r["Código de Barra"] ?? "").toString().trim();
    if (!codigo) return;

    const producto = r["Producto"] ?? "";
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
      r["PrecioPublico"] !== "" && r["PrecioPublico"] != null
        ? Number(r["PrecioPublico"])
        : null;

    if (!productsMap[codigo]) {
      productsMap[codigo] = {
        producto,
        precioPublico,
        origins: {},
        destinations: {},
        ventasOrigen: {},
      };
    }

    const prod = productsMap[codigo];

    // Ventas de la sucursal origen
    if (sucursalOrigen === sucursalDestino) {
      prod.ventasOrigen[sucursalOrigen] = ventas;
      return;
    }

    // Productos a vencer
    if (cantidad > 0) {
      prod.origins[sucursalOrigen] = {
        cantidad,
        mes,
      };
    }

    // Destinos posibles
    if (sucursalDestino && ventas >= 5) {
      prod.destinations[sucursalDestino] = {
        ventas,
        stockDestino,
        mes,
      };
    }
  });

  return productsMap;
}