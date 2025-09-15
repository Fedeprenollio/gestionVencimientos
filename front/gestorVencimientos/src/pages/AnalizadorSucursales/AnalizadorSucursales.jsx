import React, { useState } from "react";
import * as XLSX from "xlsx";
import { analizarStockEntreSucursales } from "../../../utils/calculations";

export default function AnalizadorSucursales() {
  const [stockFiles, setStockFiles] = useState([]);
  const [movFiles, setMovFiles] = useState([]);
  const [resultado, setResultado] = useState(null);

  // 🔹 Manejo de archivos de STOCK
  const handleStockFiles = async (files) => {
    const archivos = [];
    for (const file of files) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      archivos.push(...rows);
    }
    setStockFiles((prev) => [...prev, ...archivos]);
  };

  // 🔹 Manejo de archivos de MOVIMIENTOS
  const handleMovFiles = async (files) => {
    const archivos = [];
    for (const file of files) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      archivos.push(...rows);
    }
    setMovFiles((prev) => [...prev, ...archivos]);
  };

  // 🔹 Procesar y analizar
  const handleAnalizar = () => {
    const sucursalesMap = {};

    // Agrupamos STOCK
    for (const row of stockFiles) {
      const sucursalId = row.idSucursal || row.sucursalId;
      if (!sucursalId) continue;

      if (!sucursalesMap[sucursalId])
        sucursalesMap[sucursalId] = { stockData: [], movimientos: [] };

      sucursalesMap[sucursalId].stockData.push(row);
    }

    // Agrupamos MOVIMIENTOS
    for (const row of movFiles) {
      const sucursalId = row.idSucursal || row.sucursalId;
      if (!sucursalId) continue;

      if (!sucursalesMap[sucursalId])
        sucursalesMap[sucursalId] = { stockData: [], movimientos: [] };

      sucursalesMap[sucursalId].movimientos.push(row);
    }

    // Convertimos a array para enviar a la función de cálculo
    const sucursalesData = Object.entries(sucursalesMap).map(
      ([sucursalId, datos]) => ({
        sucursalId,
        ...datos,
      })
    );

    // Ejecutamos el análisis (usa calcularDSIPorProducto por dentro)
    const analisis = analizarStockEntreSucursales(sucursalesData);

    // Reorganizamos resultado: qué sucursal pide y de dónde recibe
    const resultadoPorSucursal = {};

    Object.entries(analisis).forEach(([idProducto, prodData]) => {
      prodData.deficit.forEach(({ sucursalId, dsi }) => {
        if (!resultadoPorSucursal[sucursalId])
          resultadoPorSucursal[sucursalId] = [];

        resultadoPorSucursal[sucursalId].push({
          idProducto,
          producto: prodData.nombre,
          dsi,
          enviarDesde: prodData.exceso.map(
            (e) => `${e.sucursalId} (DSI: ${e.dsi})`
          ),
        });
      });
    });

    setResultado(resultadoPorSucursal);
  };

  return (
    <div>
      <h2>Analizador de Movimientos entre Sucursales</h2>

      <div>
        <label>Archivos de Stock:</label>
        <input
          type="file"
          multiple
          onChange={(e) => handleStockFiles(e.target.files)}
        />
      </div>

      <div>
        <label>Archivos de Movimientos/Ventas:</label>
        <input
          type="file"
          multiple
          onChange={(e) => handleMovFiles(e.target.files)}
        />
      </div>

      <button onClick={handleAnalizar} style={{ marginTop: "1rem" }}>
        Analizar
      </button>

      {resultado &&
        Object.entries(resultado).map(([sucursalId, productos]) => (
          <div key={sucursalId} style={{ marginBottom: "1rem" }}>
            <h4>Sucursal: {sucursalId}</h4>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>ID Producto</th>
                  <th>DSI (Sucursal)</th>
                  <th>Enviar desde sucursales</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.idProducto}>
                    <td>{p.producto}</td>
                    <td>{p.idProducto}</td>
                    <td>{p.dsi}</td>
                    <td>
                      {p.enviarDesde.length
                        ? p.enviarDesde.join(", ")
                        : "Pedir a proveedor"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
