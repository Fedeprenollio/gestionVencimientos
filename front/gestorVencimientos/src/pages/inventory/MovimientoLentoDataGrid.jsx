// components/MovimientoLentoDataGrid.jsx
import { DataGrid } from "@mui/x-data-grid";
import useInventoryStore from "../../store/useInventoryStore";

const columns = [
  { field: "IDProducto", headerName: "ID", width: 100 },
  { field: "nombre", headerName: "Producto", width: 200 },
  { field: "rubro", headerName: "Rubro", width: 150 },
  { field: "codebar", headerName: "Código de barras", width: 150 },
  { field: "stock", headerName: "Stock", width: 100, type: "number" },
  { field: "precio", headerName: "Precio Unitario", width: 120, type: "number" },
  { field: "valorTotal", headerName: "Valor Total", width: 130, type: "number" },
];

export default function MovimientoLentoDataGrid() {
  const rows = useInventoryStore((s) => s.movimientoLento);
    console.log("rows", rows)
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows.map((row, i) => ({ id: i, ...row }))}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50, 100]}
      />
    </div>
  );
}
