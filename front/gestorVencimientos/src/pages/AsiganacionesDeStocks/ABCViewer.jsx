import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Tabs, Tab, Box, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ProductosSinVentas from "../ProductosSinVentas/ProductosSinVentas";
import ComparadorPrecios from "../ComparadorPrecios/ComparadorPrecios";
import TablaAExcel from "../ComparadorPrecios/TablaAExcel";
import TablaAExcelCofa from "../ComparadorPrecios/TablaAExcelCofa";
import TablaAExcelSud from "../ComparadorPrecios/TablaAExcelSud";
import TablaAExcelKeller from "../ComparadorPrecios/TablaAExcelKeller";

export default function ABCViewer() {
  const [ventas, setVentas] = useState([]);
  const [stock, setStock] = useState([]);
  const [abcData, setAbcData] = useState({});
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [oportunidades, setOportunidades] = useState({});
  const [sucursalOportunidad, setSucursalOportunidad] = useState(null);

  useEffect(() => {
    if (Object.keys(abcData).length > 0) {
      const analisis = analizarDSI(abcData);
      setOportunidades(analisis);

      const keys = Object.keys(analisis);
      if (!keys.includes(String(sucursalOportunidad))) {
        setSucursalOportunidad(keys[0] ?? null);
      }
    }
  }, [abcData]);

  console.log("📊 Estado inicial:", { ventas, stock, abcData });

  // --- Manejo de archivos ---
  const handleFileUpload = (event, tipo) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      console.log(`📂 Archivo ${tipo} cargado:`, json.length, "filas");

      if (tipo === "ventas") setVentas(json);
      if (tipo === "stock") setStock(json);
    };
    reader.readAsArrayBuffer(file);
  };

  // --- Procesar cuando tengamos ambos archivos ---
  useEffect(() => {
    if (ventas.length > 0 && stock.length > 0) {
      procesarABC(ventas, stock);
    }
  }, [ventas, stock]);

  const procesarABC = (ventasData, stockData) => {
    console.log("🔧 Procesando ABC...");
    console.log("📦 Primer fila del STOCK:", stockData[0]);
    console.log("📦 Claves en fila de stock:", Object.keys(stockData[0]));

    const agrupado = {};
    ventasData.forEach((row) => {
      const suc = row.sucursal;
      if (!agrupado[suc]) {
        agrupado[suc] = { items: [], NombreFantasia: row.NombreFantasia };
      }

      // Buscar producto en stock
      const stockRow = stockData.find(
        (s) => Number(s.IDProducto) === Number(row.idproducto)
      );

      let unidadesStock = 0;
      if (stockRow) {
        // Construimos el nombre de la columna dinámicamente
        const columnaSucursal = `CantStock_Suc${String(suc).padStart(3, "0")}`;
        unidadesStock = Number(stockRow[columnaSucursal] ?? 0);
      }

      agrupado[suc].items.push({
        ...row,
        codebar: row.codebar || row.Codebar || "",
        stock: unidadesStock,
        rubro: row.IdRubro || row.IdRubro || "",
      });
    });

    // --- resto de tu lógica ABC ---
    Object.keys(agrupado).forEach((suc) => {
      const items = agrupado[suc].items;

      const totalVentas = items.reduce((acc, i) => acc + (i.ACCli || 0), 0);
      const totalUnidades = items.reduce((acc, i) => acc + (i.cajas || 0), 0);

      // ABC por ventas
      const ordenVentas = [...items].sort(
        (a, b) => (b.ACCli || 0) - (a.ACCli || 0)
      );
      let acumVentas = 0;
      ordenVentas.forEach((item) => {
        const pct = totalVentas ? (item.ACCli / totalVentas) * 100 : 0;
        acumVentas += pct;
        item["%Ventas"] = pct;
        item["%AcumVentas"] = acumVentas;
        item.ClasificacionVentas =
          acumVentas <= 80 ? "A" : acumVentas <= 95 ? "B" : "C";
      });

      // ABC por unidades + DSI
      const ordenUnidades = [...items].sort(
        (a, b) => (b.cajas || 0) - (a.cajas || 0)
      );
      let acumUnidades = 0;
      ordenUnidades.forEach((item) => {
        const pct = totalUnidades ? (item.cajas / totalUnidades) * 100 : 0;
        acumUnidades += pct;
        item["%Unidades"] = pct;
        item["%AcumUnidades"] = acumUnidades;
        item.ClasificacionUnidades =
          acumUnidades <= 80 ? "A" : acumUnidades <= 95 ? "B" : "C";

        const consumoDiario = item.cajas > 0 ? item.cajas / 365 : 0;
        item.dsi =
          consumoDiario > 0
            ? Number((item.stock / consumoDiario).toFixed(1))
            : 9999;
      });

      agrupado[suc].items = items;
    });

    setAbcData(agrupado);

    const keys = Object.keys(agrupado);
    if (!keys.includes(String(selectedSucursal))) {
      setSelectedSucursal(keys[0] ?? null);
    }
  };

  const analizarDSI = (abcData, maxDestinos = 9) => {
    const resultadoPorSucursal = {};

    // 1️⃣ Crear mapa de productos agrupando sucursales
    const mapaProductos = {};
    Object.entries(abcData).forEach(([suc, data]) => {
      data.items.forEach((item) => {
        if (!mapaProductos[item.idproducto])
          mapaProductos[item.idproducto] = [];
        mapaProductos[item.idproducto].push({
          sucursal: suc,
          nombreFantasia: data.NombreFantasia,
          producto: item.producto,
          stock: item.stock,
          dsi: item.dsi,
          rubro: item.rubro, // <-- incluimos el rubro
          consumoAnual: item.cajas ?? 0,
        });
      });
    });

    // 2️⃣ Recorrer cada producto y buscar excesos + destinos
    Object.values(mapaProductos).forEach((sucursalesProducto) => {
      sucursalesProducto.forEach((origen) => {
        // 📌 Ajuste de umbral según rubro
        console.log("origen.rubro", origen.rubro);
        const umbralDSI = origen.rubro === 1 ? 361 : 731;

        if (origen.dsi < umbralDSI) return; // no es exceso

        const consumoDiario = origen.consumoAnual / 365;
        const stockNecesario = consumoDiario * 365;
        const exceso = origen.stock - stockNecesario;
        if (exceso <= 0) return;

        // Buscar destinos
        let destinos = sucursalesProducto
          .filter(
            (p) =>
              p.sucursal !== origen.sucursal &&
              // p.dsi > 0 &&
              p.dsi < 365
          )
          .sort((a, b) => a.dsi - b.dsi)
          .slice(0, maxDestinos);

        if (destinos.length === 0) return;

        // Calcular faltantes y repartir
        const necesidades = destinos.map((d) => {
          const consumoDiarioDest = d.consumoAnual / 365;
          const stockNecesarioDest = consumoDiarioDest * 180;
          const faltante = Math.max(0, stockNecesarioDest - d.stock);
          return { ...d, faltante };
        });

        const totalFaltante = necesidades.reduce(
          (acc, n) => acc + n.faltante,
          0
        );
        if (totalFaltante === 0) return;

        necesidades.forEach((dest) => {
          const proporción = dest.faltante / totalFaltante;
          const unidadesAEnviar = Math.min(
            Math.floor(exceso * proporción),
            dest.faltante
          );

          if (unidadesAEnviar > 0) {
            if (!resultadoPorSucursal[origen.sucursal]) {
              resultadoPorSucursal[origen.sucursal] = {
                NombreFantasia: origen.nombreFantasia,
                items: [],
              };
            }

            resultadoPorSucursal[origen.sucursal].items.push({
              idproducto: origen.idproducto,
              producto: origen.producto,
              stockOrigen: origen.stock,
              dsiOrigen: origen.dsi,
              exceso,
              sucursalDestino: dest.nombreFantasia,
              stockDestino: dest.stock,
              dsiDestino: dest.dsi,
              unidadesDestino: dest.consumoAnual, // <- ahora usamos directamente consumoAnual
              unidadesSugeridas: unidadesAEnviar,
            });
          }
        });
      });
    });

    return resultadoPorSucursal;
  };

  // const analizarDSI = (abcData, maxDestinos = 3) => {
  //   const resultadoPorSucursal = {};

  //   // 1️⃣ Crear mapa de productos agrupando sucursales
  //   const mapaProductos = {};
  //   Object.entries(abcData).forEach(([suc, data]) => {
  //     data.items.forEach((item) => {
  //       if (!mapaProductos[item.idproducto])
  //         mapaProductos[item.idproducto] = [];
  //       mapaProductos[item.idproducto].push({
  //         sucursal: suc,
  //         nombreFantasia: data.NombreFantasia,
  //         producto: item.producto,
  //         stock: item.stock,
  //         dsi: item.dsi,
  //         consumoAnual: item.cajas ?? 0,
  //       });
  //     });
  //   });

  //   // 2️⃣ Recorrer cada producto y buscar excesos + destinos
  //   Object.values(mapaProductos).forEach((sucursalesProducto) => {
  //     // Encontrar orígenes con exceso
  //     const origenes = sucursalesProducto.filter((p) => p.dsi >= 731);

  //     // Ordenar orígenes por exceso (mayor primero)
  //     origenes.sort((a, b) => {
  //       const excesoA = a.stock - (a.consumoAnual / 365) * 365;
  //       const excesoB = b.stock - (b.consumoAnual / 365) * 365;
  //       return excesoB - excesoA;
  //     });

  //     // Para cada origen, intentar colocar exceso en destinos
  //     origenes.forEach((origen) => {
  //       const consumoDiario = origen.consumoAnual / 365;
  //       const stockNecesario = consumoDiario * 365;
  //       const exceso = origen.stock - stockNecesario;
  //       if (exceso <= 0) return; // nada para transferir

  //       // Buscar destinos con DSI bajo
  //       let destinos = sucursalesProducto
  //         .filter(
  //           (p) => p.sucursal !== origen.sucursal && p.dsi > 0 && p.dsi < 365
  //         )
  //         .sort((a, b) => a.dsi - b.dsi) // más urgentes primero
  //         .slice(0, maxDestinos);

  //       if (destinos.length === 0) return;

  //       // Calcular "necesidad total" (cuánto le falta a cada destino para llegar a DSI 180)
  //       const necesidades = destinos.map((d) => {
  //         const consumoDiarioDest = d.consumoAnual / 365;
  //         const stockNecesarioDest = consumoDiarioDest * 180;
  //         const faltante = Math.max(0, stockNecesarioDest - d.stock);
  //         return { ...d, faltante };
  //       });

  //       const totalFaltante = necesidades.reduce(
  //         (acc, n) => acc + n.faltante,
  //         0
  //       );
  //       if (totalFaltante === 0) return;

  //       // Reparto proporcional según faltante
  //       necesidades.forEach((dest) => {
  //         const proporción = dest.faltante / totalFaltante;
  //         const unidadesAEnviar = Math.min(
  //           Math.floor(exceso * proporción),
  //           dest.faltante
  //         );

  //         if (unidadesAEnviar > 0) {
  //           if (!resultadoPorSucursal[origen.sucursal]) {
  //             resultadoPorSucursal[origen.sucursal] = {
  //               NombreFantasia: origen.nombreFantasia,
  //               items: [],
  //             };
  //           }

  //           resultadoPorSucursal[origen.sucursal].items.push({
  //             idproducto: origen.idproducto,
  //             producto: origen.producto,
  //             stockOrigen: origen.stock,
  //             dsiOrigen: origen.dsi,
  //             exceso,
  //             sucursalDestino: dest.nombreFantasia,
  //             stockDestino: dest.stock,
  //             dsiDestino: dest.dsi,
  //             unidadesSugeridas: unidadesAEnviar,
  //           });
  //         }
  //       });
  //     });
  //   });

  //   return resultadoPorSucursal;
  // };

  // --- Exportar a Excel ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    Object.entries(abcData).forEach(([suc, data]) => {
      const ws = XLSX.utils.json_to_sheet(data.items);
      const sheetName =
        data.NombreFantasia?.substring(0, 31) || `Sucursal_${suc}`; // Excel limita a 31 caracteres
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, "ABC_DSI_Sucursales.xlsx");
  };
  const exportOportunidadesToExcel = () => {
    const wb = XLSX.utils.book_new();

    Object.entries(oportunidades).forEach(([suc, data]) => {
      if (!data.items || data.items.length === 0) return;

      // Mapeamos los datos para la hoja
      const rows = data.items.map((item) => ({
        Producto: item.producto,
        "Sucursal Origen": data.NombreFantasia,
        "Stock Origen": item.stockOrigen,
        "DSI Origen": item.dsiOrigen,
        Exceso: item.exceso,
        "Sucursal Destino": item.sucursalDestino,
        "Stock Destino": item.stockDestino,
        "DSI Destino": item.dsiDestino,
        "Unidades Vend Dest": item.unidadesDestino,
        "Unidades a Transferir": item.unidadesSugeridas,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const sheetName =
        data.NombreFantasia?.substring(0, 31) || `Sucursal_${suc}`; // Excel limita a 31 caracteres
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, "Oportunidades_Stock.xlsx");
  };

  // --- Estilos para celdas ---
  const celeste = "#e3f2fd";
  const verde = "#e8f5e9";

  const columns = [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "codebar", headerName: "Codebar", width: 150 },
    {
      field: "cajas",
      headerName: "Unidades vendidas",
      width: 90,
      cellClassName: "unidades-cell",
    },
    {
      field: "ACCli",
      headerName: "Ventas $",
      width: 120,
      cellClassName: "dinero-cell",
    },
    {
      field: "%Ventas",
      headerName: "% Ventas",
      width: 110,
      cellClassName: "dinero-cell",
    },
    {
      field: "%AcumVentas",
      headerName: "% Acum Ventas",
      width: 130,
      cellClassName: "dinero-cell",
    },
    { field: "ClasificacionVentas", headerName: "ABC Ventas", width: 110 },
    {
      field: "%Unidades",
      headerName: "% Unidades",
      width: 110,
      cellClassName: "unidades-cell",
    },
    {
      field: "%AcumUnidades",
      headerName: "% Acum Unidades",
      width: 140,
      cellClassName: "unidades-cell",
    },
    { field: "ClasificacionUnidades", headerName: "ABC Unidades", width: 130 },
    { field: "stock", headerName: "Stock", width: 100 },
    {
      field: "dsi",
      headerName: "DSI (días)",
      width: 120,
      renderCell: (params) => {
        const value = params.value ?? 0;
        let color = "#ccc";

        if (value <= 30) color = "#e53935";
        else if (value <= 90) color = "#43a047";
        else if (value <= 180) color = "#fdd835";
        else if (value <= 365) color = "#fb8c00";
        else color = "#6a1b9a";

        return (
          <span
            style={{
              backgroundColor: color,
              color: "white",
              padding: "2px 8px",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
          >
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <style>
        {`
          .dinero-cell {
            background-color: ${celeste};
          }
          .unidades-cell {
            background-color: ${verde};
          }
        `}
      </style>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="body2">📥 Cargar archivo de Ventas</Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "ventas")}
          />
        </Box>
        <Box>
          <Typography variant="body2">📥 Cargar archivo de Stock</Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "stock")}
          />
        </Box>
      </Box>

      {Object.keys(abcData).length > 0 ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Tabs
              value={selectedSucursal ?? false}
              onChange={(e, newValue) => setSelectedSucursal(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider", flex: 1 }}
            >
              {Object.entries(abcData).map(([suc, data]) => (
                <Tab
                  key={suc}
                  label={data.NombreFantasia || `Sucursal ${suc}`}
                  value={suc}
                />
              ))}
            </Tabs>

            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcel}
              sx={{ ml: 2 }}
            >
              📤 Exportar Excel
            </Button>
          </Box>

          {selectedSucursal && abcData[selectedSucursal] ? (
            <Box sx={{ height: 500, width: "100%", mt: 2 }}>
              <DataGrid
                rows={abcData[selectedSucursal].items.map((item, idx) => ({
                  id: idx,
                  ...item,
                }))}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selecciona una sucursal para ver sus datos.
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body2">
          📂 Sube ambos archivos (ventas y stock) para ver el análisis ABC +
          DSI.
        </Typography>
      )}

      {Object.keys(oportunidades).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            📦 Plan de Reparto Optimizado (Para medicamentos se considera DSI
            alto mayor a 361, para perfu 721 (Cuidado si el DSI de destino es 0,
            puede tener un pedido en curso por recibir) )
          </Typography>

          <Tabs
            value={sucursalOportunidad ?? false}
            onChange={(e, newValue) => setSucursalOportunidad(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            {Object.entries(oportunidades).map(([suc, data]) => (
              <Tab
                key={suc}
                value={suc}
                label={data.NombreFantasia || `Sucursal ${suc}`}
              />
            ))}
          </Tabs>

          {sucursalOportunidad && oportunidades[sucursalOportunidad] ? (
            <DataGrid
              rows={oportunidades[sucursalOportunidad].items.map(
                (item, idx) => ({
                  id: idx,
                  producto: item.producto,
                  sucursalOrigen:
                    oportunidades[sucursalOportunidad].NombreFantasia,
                  stockOrigen: item.stockOrigen,
                  dsiOrigen: item.dsiOrigen,
                  exceso: item.exceso,
                  sucursalDestino: item.sucursalDestino,
                  stockDestino: item.stockDestino,
                  dsiDestino: item.dsiDestino,
                  unidadesDestino: item.unidadesDestino, // <- nueva columna
                  unidadesTransferir: item.unidadesSugeridas,
                })
              )}
              columns={[
                { field: "producto", headerName: "Producto", flex: 1 },
                {
                  field: "sucursalOrigen",
                  headerName: "Sucursal Origen",
                  flex: 1,
                },
                {
                  field: "stockOrigen",
                  headerName: "Stock Origen",
                  width: 120,
                },
                { field: "dsiOrigen", headerName: "DSI Origen", width: 120 },
                { field: "exceso", headerName: "Exceso", width: 120 },
                {
                  field: "sucursalDestino",
                  headerName: "Sucursal Destino",
                  flex: 1,
                },
                {
                  field: "stockDestino",
                  headerName: "Stock Destino",
                  width: 120,
                },
                { field: "dsiDestino", headerName: "DSI Destino", width: 120 },
                {
                  field: "unidadesDestino",
                  headerName: "Unidades Vend Dest",
                  width: 150,
                },
                {
                  field: "unidadesTransferir",
                  headerName: "Unidades a Transferir",
                  width: 180,
                },
              ]}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
            />
          ) : (
            <Typography variant="body2">
              No hay productos que cumplan la condición para esta sucursal.
            </Typography>
          )}
        </Box>
      )}
      <Button
        variant="contained"
        color="secondary"
        onClick={exportOportunidadesToExcel}
        sx={{ ml: 2 }}
      >
        📤 Exportar Movimientos de Stock
      </Button>

      <ProductosSinVentas />

-------
  Descargar tablas Del Sud

  <TablaAExcelSud/>


---------

Descargar tabla a excel de cofa

<TablaAExcelCofa/>

------------
  Descargar tabla de Suizo

<TablaAExcel/>
----------
  
Descargar tabla de Keller

<TablaAExcelKeller/>

      ------------------------------------------
      ComparadorPrecios

      <ComparadorPrecios/>
    </Box>
  );
}
