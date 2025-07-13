
// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import {
//   Box,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
//   Button,
//   Tabs,
//   Tab,
// } from "@mui/material";
// import { useParams } from "react-router-dom";
// import { fetchListById } from "../../api/listApi";
// import TagStatusTable from "../price/TagStatusTable";

// export default function BarcodeSalesAnalyzer() {
//   const { listId } = useParams();
//   const [list, setList] = useState(null);
//   const [sold, setSold] = useState([]);
//   const [expired, setExpired] = useState([]);
//   const [notSold, setNotSold] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [codeToNameMap, setCodeToNameMap] = useState({});
//   const [activeTab, setActiveTab] = useState(0);

//   useEffect(() => {
//     async function loadListCodes() {
//       if (!listId) return;
//       const list = await fetchListById(listId);
//       const map = {};
//       list.products?.forEach((p) => {
//         if (p.product?.barcode) {
//           map[p.product.barcode.trim()] = {
//             name: p.product.name || "(sin nombre)",
//             stock: p.product.stock ?? "?",
//           };
//         }
//       });
//       setCodeToNameMap(map);
//       setList(list);
//     }

//     loadListCodes();
//   }, [listId]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setLoading(true);

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const json = XLSX.utils.sheet_to_json(sheet);

//       const found = {};
//       const vencidos = {};

//       json.forEach((row) => {
//         const codebar = String(row.Codebar).trim();
//         const operacion = String(row.Operacion || "").toLowerCase();
//         const cantidad = Number(row.Cantidad || 0);
//         const producto = String(row.Producto || "");
//         const isInList = !!codeToNameMap[codebar];

//         if (isInList && operacion.includes("facturacion")) {
//           if (!found[codebar]) {
//             found[codebar] = { producto, cantidad: 0 };
//           }
//           found[codebar].cantidad += cantidad;
//         } else if (
//           isInList &&
//           (operacion.includes("vencido") ||
//             operacion.includes("devolucion por vencimiento"))
//         ) {
//           if (!vencidos[codebar]) {
//             vencidos[codebar] = { producto, cantidad: 0 };
//           }
//           vencidos[codebar].cantidad += cantidad;
//         }
//       });

//       const vendidos = Object.entries(found).map(([codebar, data]) => ({
//         codebar,
//         producto: data.producto,
//         cantidad: data.cantidad,
//       }));

//       const vencidosArr = Object.entries(vencidos).map(([codebar, data]) => ({
//         codebar,
//         producto: data.producto,
//         cantidad: data.cantidad,
//       }));

//       const noVendidos = Object.keys(codeToNameMap)
//         .filter((cb) => !found[cb])
//         .map((cb) => ({
//           codebar: cb,
//           producto: codeToNameMap[cb]?.name || "(sin nombre)",
//         }));

//       setSold(vendidos);
//       setExpired(vencidosArr);
//       setNotSold(noVendidos);
//       setLoading(false);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const renderTable = (data, type) => (
//     <Table size="small">
//       <TableHead>
//         <TableRow>
//           <TableCell><strong>Stock</strong></TableCell>
//           <TableCell><strong>Producto</strong></TableCell>
//           <TableCell><strong>Código</strong></TableCell>
//           {type !== "notSold" && <TableCell><strong>Unidades</strong></TableCell>}
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {data.map((item) => (
//           <TableRow key={item.codebar}>
//             <TableCell>{codeToNameMap[item.codebar]?.stock ?? "?"}</TableCell>
//             <TableCell>{item.producto}</TableCell>
//             <TableCell>{item.codebar}</TableCell>
//             {type !== "notSold" && <TableCell>{item.cantidad}</TableCell>}
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );

//   return (
//     <Box p={3}>
//       <Typography variant="h6" gutterBottom>
//         Analizar ventas de productos
//       </Typography>

//       {list && (
//         <Typography variant="subtitle1" gutterBottom>
//           Lista: <strong>{list.name}</strong>
//         </Typography>
//       )}

//       <Typography variant="body2" color="text.secondary" mb={1}>
//         Subí un archivo Excel con columnas: <strong>Codebar</strong>, <strong>Producto</strong>, <strong>Operacion</strong>, <strong>Cantidad</strong>  - Reporte de Listado de Movimientos
//       </Typography>

//       <Button variant="contained" component="label">
//         Subir archivo Excel
//         <input hidden type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
//       </Button>

//       {loading && <Typography mt={2}>Procesando archivo...</Typography>}

//       {!loading &&
//         (sold.length > 0 || notSold.length > 0 || expired.length > 0) && (
//           <Box mt={3}>
//             <Tabs
//               value={activeTab}
//               onChange={(_, newValue) => setActiveTab(newValue)}
//               textColor="primary"
//               indicatorColor="primary"
//             >
//               <Tab label={`Vendidos (${sold.length})`} />
//               <Tab label={`Sin ventas (${notSold.length})`} />
//               <Tab label={`Vencidos (${expired.length})`} />
//             </Tabs>

//             <Box mt={2}>
//               {activeTab === 0 && (
//                 <Paper sx={{ p: 2 }}>{renderTable(sold, "sold")}</Paper>
//               )}
//               {activeTab === 1 && (
//                 <Paper sx={{ p: 2 }}>{renderTable(notSold, "notSold")}</Paper>
//               )}
//               {activeTab === 2 && (
//                 <Paper sx={{ p: 2 }}>{renderTable(expired, "expired")}</Paper>
//               )}
//             </Box>
//           </Box>
//         )}

//       {/* {list && <TagStatusTable productList={list} />} */}
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"; // Importa DataGrid
import { useParams, useSearchParams } from "react-router-dom";
import { fetchListById } from "../../api/listApi";
import * as XLSX from "xlsx";
import axios from "axios";
export default function BarcodeSalesAnalyzer() {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [sold, setSold] = useState([]);
  const [expired, setExpired] = useState([]);
  const [notSold, setNotSold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [codeToNameMap, setCodeToNameMap] = useState({});
  const [activeTab, setActiveTab] = useState(0);
const [searchParams] = useSearchParams();
const type = searchParams.get("type"); // 'list' o 'stock'

  useEffect(() => {
    // async function loadListCodes() {
    //   if (!listId) return;
    //   const list = await fetchListById(listId);
    //   const map = {};
    //   list.products?.forEach((p) => {
    //     if (p.product?.barcode) {
    //       map[p.product.barcode.trim()] = {
    //         name: p.product.name || "(sin nombre)",
    //         stock: p.product.stock ?? "?",
    //       };
    //     }
    //   });
    //   setCodeToNameMap(map);
    //   setList(list);
    // }
async function loadListCodes() {
  if (!listId || !type) return;

  const map = {};

  if (type === "list") {
    try {
      const list = await fetchListById(listId);
      console.log("RES list", list)
      list.products?.forEach((p) => {
        const barcode = p.product?.barcode?.trim();
        if (barcode) {
          map[barcode] = {
            name: p.product.name || "(sin nombre)",
            stock: p.product.stock ?? "?",
          };
        }
      });
      setList(list);
      setCodeToNameMap(map);
    } catch (error) {
      console.error("Error al cargar la lista:", error);
    }
  }  else if (type === "stock") {
  try {
    const res = await axios.get(import.meta.env.VITE_API_URL + `/stock-count/${listId}`);
    const data = res.data || {};
    const products = data.products || [];
    const map = {};

    products.forEach((p) => {
      const barcode = p.product?.barcode?.trim();
      if (barcode) {
        map[barcode] = {
          name: p.product.name || "(sin nombre)",
          stock: p.quantity ?? "?",
        };
      }
    });

    setList(data);
    setCodeToNameMap(map);
  } catch (error) {
    console.error("Error al cargar stock-count:", error);
  }
}
}
loadListCodes();
}, [listId, type]);
console.log("LITSA", list)

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const found = {};
      const vencidos = {};

      json.forEach((row) => {
        const codebar = String(row.Codebar).trim();
        const operacion = String(row.Operacion || "").toLowerCase();
        const cantidad = Number(row.Cantidad || 0);
        const producto = String(row.Producto || "");
        const isInList = !!codeToNameMap[codebar];

        if (isInList && operacion.includes("facturacion")) {
          if (!found[codebar]) {
            found[codebar] = { producto, cantidad: 0 };
          }
          found[codebar].cantidad += cantidad;
        } else if (
          isInList &&
          (operacion.includes("vencido") ||
            operacion.includes("devolucion por vencimiento"))
        ) {
          if (!vencidos[codebar]) {
            vencidos[codebar] = { producto, cantidad: 0 };
          }
          vencidos[codebar].cantidad += cantidad;
        }
      });

      const vendidos = Object.entries(found).map(([codebar, data]) => ({
        id: codebar,
        codebar,
        producto: data.producto,
        cantidad: data.cantidad,
        stock: codeToNameMap[codebar]?.stock ?? "?",
      }));

      const vencidosArr = Object.entries(vencidos).map(([codebar, data]) => ({
        id: codebar,
        codebar,
        producto: data.producto,
        cantidad: data.cantidad,
        stock: codeToNameMap[codebar]?.stock ?? "?",
      }));

      const noVendidos = Object.keys(codeToNameMap)
        .filter((cb) => !found[cb])
        .map((cb) => ({
          id: cb,
          codebar: cb,
          producto: codeToNameMap[cb]?.name || "(sin nombre)",
          stock: codeToNameMap[cb]?.stock ?? "?",
        }));

      setSold(vendidos);
      setExpired(vencidosArr);
      setNotSold(noVendidos);
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Definimos columnas para DataGrid
  const columns = [
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      sortable: true,
    },
    {
      field: "producto",
      headerName: "Producto",
      flex: 1,
      sortable: true,
    },
    {
      field: "codebar",
      headerName: "Código",
      width: 150,
      sortable: true,
    },
    {
      field: "cantidad",
      headerName: "Unidades",
      width: 120,
      sortable: true,
      // ocultamos columna 'cantidad' para el tab de sin ventas
      hide: activeTab === 1,
    },
  ];

  // Elegir datos a mostrar según pestaña
  const getDataForTab = () => {
    if (activeTab === 0) return sold;
    if (activeTab === 1) return notSold;
    if (activeTab === 2) return expired;
    return [];
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Analizar ventas de productos
      </Typography>

      {list && (
        <Typography variant="subtitle1" gutterBottom>
          Lista: <strong>{list.name}</strong>
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" mb={1}>
        Subí un archivo Excel con columnas: <strong>Codebar</strong>,{" "}
        <strong>Producto</strong>, <strong>Operacion</strong>, <strong>Cantidad</strong> - Reporte de Listado de Movimientos
      </Typography>

      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Subir archivo Excel
        <input hidden type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </Button>

      {loading && <Typography mt={2}>Procesando archivo...</Typography>}

      {!loading && (sold.length > 0 || notSold.length > 0 || expired.length > 0) && (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={`Vendidos (${sold.length})`} />
            <Tab label={`Sin ventas (${notSold.length})`} />
            <Tab label={`Vencidos (${expired.length})`} />
          </Tabs>

          <Box mt={2} style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={getDataForTab()}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              sortingOrder={["asc", "desc"]}
              initialState={{
                sorting: {
                  sortModel: [{ field: "producto", sort: "asc" }],
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
