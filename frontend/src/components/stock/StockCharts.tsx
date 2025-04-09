import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { InventoryAnalysis } from '../../services/api';

interface StockChartsProps {
  data: InventoryAnalysis;
}

const StockCharts: React.FC<StockChartsProps> = ({ data }) => {
  const statusColors = {
    out: '#f44336', // error
    low: '#ff9800', // warning
    over: '#2196f3', // info
    ok: '#4caf50' // success
  };

  const statusLabels = {
    out: 'Sin Stock',
    low: 'Bajo Stock',
    over: 'Sobre Stock',
    ok: 'OK'
  };

  // Preparar datos para el gráfico de torta
  const pieData = Object.entries(data.countByStatus).map(([key, value]) => ({
    name: statusLabels[key as keyof typeof statusLabels],
    value,
    color: statusColors[key as keyof typeof statusColors]
  }));

  // Preparar datos para el gráfico de barras (Análisis ABC)
  const barData = data.abcAnalysis
    ? [
        { name: 'A', value: data.abcAnalysis.a, color: '#4caf50' },
        { name: 'B', value: data.abcAnalysis.b, color: '#ff9800' },
        { name: 'C', value: data.abcAnalysis.c, color: '#f44336' }
      ]
    : [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Distribución por Estado
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} productos`, '']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {data.abcAnalysis && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Análisis ABC
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Porcentaje de Valor"
                    radius={[4, 4, 0, 0]}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default StockCharts;