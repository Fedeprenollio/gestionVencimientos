import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import useInventoryStore from "../../store/useInventoryStore";

const ProductosDevueltosVencimientoGrid = () => {
  const devoluciones = useInventoryStore((s) => s.devolucionesPorVencimiento);

  if (!devoluciones || devoluciones.length === 0) return null;

  // Definimos columnas para DataGrid
  const columns = [
    { 
      field: "nombre", 
      headerName: "Producto", 
      flex: 2,
      minWidth: 200,
    },
    {
      field: "codebar",
      headerName: "Cod. Barras",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "cantidad",
      headerName: "Cantidad Devuelta",
      type: "number",
      flex: 1,
      minWidth: 140,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "precioUnitario",
      headerName: "Precio Unitario",
      type: "number",
      flex: 1,
      minWidth: 130,
      headerAlign: "right",
      align: "right",
    //   valueFormatter: ({ value }) =>
    //     value != null ? `$${value.toFixed(2)}` : "$0.00",
    },
    {
      field: "perdidaTotal",
      headerName: "Pérdida Total",
      type: "number",
      flex: 1,
      minWidth: 130,
      headerAlign: "right",
      align: "right",
    //   valueFormatter: ({ value }) =>
    //     value != null ? `$${value.toFixed(2)}` : "$0.00",
      cellClassName: "perdida-cell",
    },
  ];

  // Necesitamos que cada fila tenga un id único para DataGrid
  // Usamos IDProducto como id, asegurándonos que sea string
  const rows = devoluciones.map((item) => ({
    id: String(item.IDProducto),
    ...item,
  }));

  return (
    <div style={{ height: 500, width: "100%", marginTop: 16 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        getRowId={(row) => row.id}
        sx={{
          "& .perdida-cell": {
            color: "error.main",
            fontWeight: "bold",
          },
        }}
      />
    </div>
  );
};

export default ProductosDevueltosVencimientoGrid;
