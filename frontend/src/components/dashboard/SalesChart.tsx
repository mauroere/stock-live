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
import { Card, CardContent, Typography } from '@mui/material';
import { DailySales } from '../../features/dashboard/dashboardSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: DailySales[];
}

export const SalesChart = ({ data }: SalesChartProps) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Ingresos Diarios',
        data: data.map(item => item.revenue),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
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
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
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
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
};