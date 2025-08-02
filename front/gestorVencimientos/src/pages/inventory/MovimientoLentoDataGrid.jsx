// components/MovimientoLentoDataGrid.jsx
import { DataGrid } from "@mui/x-data-grid";
import useInventoryStore from "../../store/useInventoryStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";

function exportToExcel({
  data,
  fileName = "export.xlsx",
  sheetName = "Sheet1",
}) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, fileName);
}
const columns = [
  { field: "IDProducto", headerName: "ID", width: 100 },
  { field: "nombre", headerName: "Producto", width: 200 },
  { field: "rubro", headerName: "Rubro", width: 150 },
  { field: "codebar", headerName: "Código de barras", width: 150 },
  { field: "stock", headerName: "Stock", width: 100, type: "number" },
  {
    field: "precio",
    headerName: "Precio Unitario",
    width: 120,
    type: "number",
  },
  {
    field: "valorTotal",
    headerName: "Valor Total",
    width: 130,
    type: "number",
  },
];

export default function MovimientoLentoDataGrid() {
  const rows = useInventoryStore((s) => s.movimientoLento);
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows.map((row, i) => ({ id: i, ...row }))}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50, 100]}
      />

      <Button
        variant="contained"
        color="success"
        sx={{ ml: 2 }}
        onClick={() =>
          exportToExcel({
            data: rows,
            fileName: `indicador lenta rotacion.xlsx`,
          })
        }
      >
        Exportar a Excel
      </Button>
    </div>
  );
}
