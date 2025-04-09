import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { SalesTrend } from '../../features/sales/salesSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesTrendChartProps {
  data: SalesTrend[];
}

export const SalesTrendChart = ({ data }: SalesTrendChartProps) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('es-AR')),
    datasets: [
      {
        label: 'Ingresos',
        data: data.map(item => item.revenue),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: 'Órdenes',
        data: data.map(item => item.orderCount),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Ingresos'
        },
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Órdenes'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <Card sx={{ height: '100%', p: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Tendencia de Ventas
        </Typography>
        <Box sx={{ height: 400 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};