// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Chip,
// } from "@mui/material";
// import * as XLSX from "xlsx";

// export default function SearchStockPage() {
//   const [pedidoCodigos, setPedidoCodigos] = useState([]);
//   const [stockPorVencer, setStockPorVencer] = useState([]);
//   const [coincidencias, setCoincidencias] = useState([]);
//   const [txtFiles, setTxtFiles] = useState([]);
//   const [excelFile, setExcelFile] = useState(null);

//   const handleTxtUpload = (event) => {
//     const files = event.target.files;
//     setTxtFiles(Array.from(files).map((f) => f.name));

//     const allCodigos = [];

//     const readAllTxts = Array.from(files).map((file) =>
//       file.text().then((text) => {
//         text.split(/\r?\n/).forEach((line) => {
//           // extrae todas las secuencias de dígitos
//           const matches = line.match(/\d+/g) || [];
//           // filtra longitudes >= 3
//           matches
//             .filter((n) => n.length >= 3)
//             .forEach((n) => allCodigos.push(n));
//         });
//       })
//     );

//     Promise.all(readAllTxts).then(() => {
//       // elimina duplicados
//       const únicos = [...new Set(allCodigos)];
//       setPedidoCodigos(únicos);
//     });
//   };

//   const handleExcelUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
//     setExcelFile(file.name);

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
//       setStockPorVencer(jsonData);
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const cruzarDatos = () => {
//     if (!pedidoCodigos.length || !stockPorVencer.length) return;
//     const codigosSet = new Set(pedidoCodigos.map((c) => c.trim()));
//     const matches = stockPorVencer.filter((item) =>
//       codigosSet.has(item.Codigo?.toString().trim())
//     );
//     setCoincidencias(matches);
//   };

//   return (
//     <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
//       <Typography variant="h5" gutterBottom>
//         Buscar Stock en Sucursales
//       </Typography>

//       <Typography variant="body1" gutterBottom>
//         1. Subí uno o varios archivos TXT con los pedidos del día.
//       </Typography>
//       <Button variant="outlined" component="label" sx={{ mb: 2 }}>
//         Subir TXT
//         <input
//           type="file"
//           multiple
//           accept=".txt"
//           hidden
//           onChange={handleTxtUpload}
//         />
//       </Button>
//       {txtFiles.length > 0 && (
//         <Box mb={2}>
//           <Typography variant="body2">Archivos TXT cargados:</Typography>
//           {txtFiles.map((name, idx) => (
//             <Chip key={idx} label={name} sx={{ mr: 1, mt: 1 }} />
//           ))}
//           <Typography variant="body2" mt={2}>
//             Códigos detectados (>=3 dígitos):
//           </Typography>
//           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
//             {pedidoCodigos.map((code, i) => (
//               <Chip key={i} label={code} size="small" />
//             ))}
//           </Box>
//         </Box>
//       )}

//       <Typography variant="body1" gutterBottom mt={3}>
//         2. Subí archivo Excel con el stock por vencer de todas las sucursales.
//       </Typography>
//       <Button variant="outlined" component="label" sx={{ mb: 2 }}>
//         Subir Excel
//         <input
//           type="file"
//           accept=".xlsx, .xls, .csv"
//           hidden
//           onChange={handleExcelUpload}
//         />
//       </Button>
//       {excelFile && (
//         <Typography variant="body2" mb={2}>
//           Archivo Excel cargado: <strong>{excelFile}</strong>
//         </Typography>
//       )}

//       <Button
//         variant="contained"
//         sx={{ mt: 2 }}
//         disabled={!pedidoCodigos.length || !stockPorVencer.length}
//         onClick={cruzarDatos}
//       >
//         Buscar coincidencias
//       </Button>

//       {coincidencias.length > 0 && (
//         <Box mt={4}>
//           <Typography variant="h6" gutterBottom>
//             Productos pedidos que ya existen en stock por vencer
//           </Typography>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell>Producto</TableCell>
//                 <TableCell>Código</TableCell>
//                 <TableCell>Tipo</TableCell>
//                 <TableCell>Sucursal</TableCell>
//                 <TableCell>Cantidad</TableCell>
//                 <TableCell>Vencimiento</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {coincidencias.map((item, idx) => (
//                 <TableRow key={idx}>
//                   <TableCell>{item.Producto}</TableCell>
//                   <TableCell>{item.Codigo}</TableCell>
//                   <TableCell>{item.Tipo}</TableCell>
//                   <TableCell>{item.Sucursal}</TableCell>
//                   <TableCell>{item.Cantidad}</TableCell>
//                   <TableCell>{item.Vencimiento}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Box>
//       )}
//     </Box>
//   );
// }

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import * as XLSX from "xlsx";

export default function SearchStockPage() {
  const [pedidoCodigos, setPedidoCodigos] = useState([]);
  const [stockPorVencer, setStockPorVencer] = useState([]);
  const [coincidencias, setCoincidencias] = useState([]);
  const [txtFiles, setTxtFiles] = useState([]);
  const [excelFile, setExcelFile] = useState(null);

  const handleTxtUpload = (event) => {
    const files = event.target.files;
    setTxtFiles(Array.from(files).map((f) => f.name));

    const allCodigos = [];

    const readAllTxts = Array.from(files).map((file) =>
      file.text().then((text) => {
        text.split(/\r?\n/).forEach((line) => {
          const matches = line.match(/\d+/g) || [];
          matches
            .filter((n) => n.length >= 3)
            .forEach((n) => allCodigos.push(n));
        });
      })
    );

    Promise.all(readAllTxts).then(() => {
      const únicos = [...new Set(allCodigos)];
      setPedidoCodigos(únicos);
    });
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setExcelFile(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setStockPorVencer(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const cruzarDatos = () => {
    if (!pedidoCodigos.length || !stockPorVencer.length) {
      alert("Primero subí los archivos TXT y Excel.");
      return;
    }

    const codigosSet = new Set(pedidoCodigos.map((c) => c.trim()));
    const matches = stockPorVencer.filter((item) =>
      codigosSet.has(item.Codigo?.toString().trim())
    );
    setCoincidencias(matches);
  };

  const exportarExcel = () => {
    if (!coincidencias.length) {
      alert("No hay coincidencias para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(coincidencias);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Coincidencias");
    XLSX.writeFile(workbook, "coincidencias_stock.xlsx");
  };

  const limpiarTodo = () => {
    setPedidoCodigos([]);
    setStockPorVencer([]);
    setCoincidencias([]);
    setTxtFiles([]);
    setExcelFile(null);
  };

  return (
    <Box sx={{ px: 2, py: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Buscar Stock en Sucursales
      </Typography>

      <Typography variant="body1" gutterBottom>
        1. Subí archivos TXT con los pedidos del día.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Button variant="outlined" component="label" fullWidth>
            Subir TXT
            <input
              type="file"
              multiple
              accept=".txt"
              hidden
              onChange={handleTxtUpload}
            />
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="outlined" component="label" fullWidth>
            Subir Excel
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              hidden
              onChange={handleExcelUpload}
            />
          </Button>
        </Grid>
      </Grid>

      {txtFiles.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2">Archivos TXT cargados:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {txtFiles.map((name, idx) => (
              <Chip key={idx} label={name} />
            ))}
          </Box>

          <Typography variant="subtitle2" mt={2}>
            Códigos detectados:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {pedidoCodigos.map((code, i) => (
              <Chip key={i} label={code} size="small" />
            ))}
          </Box>
        </Box>
      )}

      {excelFile && (
        <Typography variant="body2" mb={2}>
          Archivo Excel cargado: <strong>{excelFile}</strong>
        </Typography>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={cruzarDatos}
          disabled={!pedidoCodigos.length || !stockPorVencer.length}
          fullWidth
        >
          Buscar coincidencias
        </Button>

        <Button
          variant="outlined"
          onClick={exportarExcel}
          disabled={!coincidencias.length}
          fullWidth
        >
          Exportar a Excel
        </Button>

        <Button variant="text" onClick={limpiarTodo} color="error" fullWidth>
          Reiniciar
        </Button>
      </Stack>

      {coincidencias.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Productos pedidos en stock por vencer
          </Typography>
          <Paper sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Vencimiento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coincidencias.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.Producto}</TableCell>
                    <TableCell>{item.Codigo}</TableCell>
                    <TableCell>{item.Tipo}</TableCell>
                    <TableCell>{item.Sucursal}</TableCell>
                    <TableCell>{item.Cantidad}</TableCell>
                    <TableCell>{item.Vencimiento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
}


