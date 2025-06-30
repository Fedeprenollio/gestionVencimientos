import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Input,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchListById } from "../../api/listApi";

export default function BarcodeSalesAnalyzer() {
  const { listId } = useParams();

  const [sold, setSold] = useState([]);
  const [expired, setExpired] = useState([]);

  const [notSold, setNotSold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbCodes, setDbCodes] = useState([]);

  const localStorageKey = `tempCodesForList_${listId}`;
  const tempCodes = JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  useEffect(() => {
    async function loadListCodes() {
      if (!listId) return;
      const list = await fetchListById(listId);
      const codesFromDB =
        list.products?.map((p) => p.barcode?.trim()).filter(Boolean) || [];
      setDbCodes(codesFromDB);
    }
    loadListCodes();
  }, [listId]);

  // Unir y eliminar duplicados
  const combinedCodes = Array.from(
    new Set([...tempCodes.map((c) => c.trim()), ...dbCodes])
  );

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

        if (
          combinedCodes.includes(codebar) &&
          operacion.includes("facturacion")
        ) {
          if (!found[codebar]) {
            found[codebar] = {
              producto,
              cantidad: 0,
            };
          }
          found[codebar].cantidad += cantidad;
        } else if (
          combinedCodes.includes(codebar) &&
          (operacion.includes("vencido") ||
            operacion.includes("devolucion por vencimiento"))
        ) {
          if (!vencidos[codebar]) {
            vencidos[codebar] = {
              producto,
              cantidad: 0,
            };
          }
          vencidos[codebar].cantidad += cantidad;
        }
      });

      const vendidos = Object.entries(found).map(([codebar, data]) => ({
        codebar,
        producto: data.producto,
        cantidad: data.cantidad,
      }));

      const noVendidos = combinedCodes
        .filter((cb) => !found[cb])
        .map((cb) => {
          const row = json.find((r) => String(r.Codebar).trim() === cb);
          return {
            codebar: cb,
            producto: row?.Producto || "(sin nombre)",
          };
        });

      setSold(vendidos);
      setNotSold(noVendidos);
      const vencidosArr = Object.entries(vencidos).map(([codebar, data]) => ({
        codebar,
        producto: data.producto,
        cantidad: data.cantidad,
      }));
      setExpired(vencidosArr);

      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Analizar ventas de productos
      </Typography>

      <Input
        type="file"
        onChange={handleFileUpload}
        inputProps={{ accept: ".xlsx, .xls" }}
      />
      {loading && <Typography mt={2}>Procesando archivo...</Typography>}

      {sold.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1">Productos vendidos</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Unidades vendidas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sold.map((s) => (
                <TableRow key={s.codebar}>
                  <TableCell>{s.producto}</TableCell>
                  <TableCell>{s.codebar}</TableCell>
                  <TableCell>{s.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {notSold.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1">Productos sin ventas</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notSold.map((n) => (
                <TableRow key={n.codebar}>
                  <TableCell>{n.producto}</TableCell>
                  <TableCell>{n.codebar}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {expired.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1">
            Productos dados de baja por vencimiento
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Unidades vencidas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expired.map((item) => (
                <TableRow key={item.codebar}>
                  <TableCell>{item.producto}</TableCell>
                  <TableCell>{item.codebar}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
