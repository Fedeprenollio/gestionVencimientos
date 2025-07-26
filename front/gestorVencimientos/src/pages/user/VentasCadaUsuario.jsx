import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TextField } from "@mui/material";
import React from "react";

export const VentasCadaUsuario = ({
  orderDirection,
  orderBy,
  handleSortRequest,
  filasOrdenadas,
  horasPorDia,
  handleHorasChange,
  diasPorUsuario,
  calcularValorHora,
}) => {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sortDirection={orderBy === "operador" ? orderDirection : false}
            >
              <TableSortLabel
                active={orderBy === "operador"}
                direction={orderBy === "operador" ? orderDirection : "asc"}
                onClick={() => handleSortRequest("operador")}
              >
                Usuario
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Horas/día</TableCell>
            <TableCell align="right">Días con ventas</TableCell>
            <TableCell
              align="right"
              sortDirection={orderBy === "cantidad" ? orderDirection : false}
            >
              <TableSortLabel
                active={orderBy === "cantidad"}
                direction={orderBy === "cantidad" ? orderDirection : "asc"}
                onClick={() => handleSortRequest("cantidad")}
              >
                Unidades
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={orderBy === "total" ? orderDirection : false}
            >
              <TableSortLabel
                active={orderBy === "total"}
                direction={orderBy === "total" ? orderDirection : "asc"}
                onClick={() => handleSortRequest("total")}
              >
                Total vendido ($)
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Valor/hora ($)</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filasOrdenadas.map(({ operador, cantidad, total }) => (
            <TableRow key={operador}>
              <TableCell>{operador}</TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  size="small"
                  value={horasPorDia[operador] ?? 7.33}
                  onChange={(e) => handleHorasChange(operador, e.target.value)}
                  inputProps={{ min: 1, style: { textAlign: "right" } }}
                  sx={{ width: 80 }}
                />
              </TableCell>
              <TableCell align="right">
                {diasPorUsuario[operador] || 0}
              </TableCell>
              <TableCell align="right">{cantidad}</TableCell>
              <TableCell align="right">${total.toFixed(2)}</TableCell>
              <TableCell align="right">
                ${calcularValorHora(operador, total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
