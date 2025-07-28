// components/IndiceMermaMensualChart.jsx
import React from "react";
import useInventoryStore from "../../store/useInventoryStore";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  LabelList,
} from "recharts";

export default function IndiceMermaMensualChart() {
  const mermaPorVencimiento = useInventoryStore((s) => s.mermaPorVencimiento);

  const formatoPesos = (valor) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <div>
      <h3>📉 Índice de Merma por Vencimiento (mensual)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={mermaPorVencimiento}>
          <CartesianGrid stroke="#a19b9b" />
          <XAxis dataKey="mes" />
          <YAxis yAxisId="left" unit="%" />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatoPesos}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "Dinero") {
                return [`${formatoPesos(value)}`, name];
              }
              return [`${value.toFixed(1)}%`, name];
            }}
            contentStyle={{ fontWeight: "bold" }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Bar
            yAxisId="right"
            dataKey="vencimientos"
            fill="#82ca9d"
            name="Dinero"
            
          >
            <LabelList
              dataKey="vencimientos"
              position="top"
              formatter={formatoPesos}
              content={({ x, y, value }) => (
                <text
                  x={x}
                  y={y - 4}
                  fill="#333"
                  fontSize={12}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {formatoPesos(value)}
                </text>
              )}
            />
          </Bar>
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="indiceMerma"
            stroke="#e53935"
            name="Merma por Vencimiento (%)"
            strokeWidth={2}
          >
            <LabelList
              dataKey="indiceMerma"
              position="bottom"
              content={({ x, y, value }) => (
                <text
                  x={x}
                  y={y - 4}
                  fill="#333"
                  fontSize={12}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {`${value}%`}
                </text>
              )}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
