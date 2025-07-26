import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";

export default function GraficoVentasPorHora({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 50, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="franja"
          angle={-45}
          textAnchor="end"
          interval={0}
          height={60}
          dy={10} // mueve el texto hacia abajo
        />
        <YAxis yAxisId="left" label={{ value: 'Unidades', angle: -90, position: 'insideLeft',  }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'Total $', angle: -90, position: 'insideRight' }}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          dataKey="cantidad"
          fill="#8884d8"
          name="Unidades"
        />
        <Bar
          yAxisId="right"
          dataKey="total"
          fill="#82ca9d"
          name="Total $"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
