import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CategorySale, PaymentMethodSale } from '../../features/sales/salesSlice';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SalesDistributionChartsProps {
  categorySales: CategorySale[];
  paymentMethods: PaymentMethodSale[];
}

const generateChartColors = (count: number) => {
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ];

  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export const SalesDistributionCharts: React.FC<SalesDistributionChartsProps> = ({
  categorySales,
  paymentMethods
}) => {
  const categoryChartData = {
    labels: categorySales.map(cat => cat.name),
    datasets: [
      {
        data: categorySales.map(cat => cat.revenue),
        backgroundColor: generateChartColors(categorySales.length),
        borderWidth: 1
      }
    ]
  };

  const paymentChartData = {
    labels: paymentMethods.map(method => method.method),
    datasets: [
      {
        data: paymentMethods.map(method => method.amount),
        backgroundColor: generateChartColors(paymentMethods.length),
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS'
            }).format(value);
            return `${context.label}: ${formattedValue} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              Ventas por Categoría
            </Typography>
            <Pie data={categoryChartData} options={options} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              Ventas por Método de Pago
            </Typography>
            <Pie data={paymentChartData} options={options} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};