import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Grid, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { AttachMoney, Inventory, ShoppingCart, TrendingUp } from '@mui/icons-material';
import { 
  fetchDashboardData,
  selectDashboardMetrics,
  selectDashboardStatus,
  selectDashboardError,
  selectLowStockProducts,
  selectDailySales
} from '../features/dashboard/dashboardSlice';
import { KPICard } from '../components/dashboard/KPICard';
import { AlertCard } from '../components/dashboard/AlertCard';
import { SalesChart } from '../components/dashboard/SalesChart';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector(selectDashboardMetrics);
  const status = useAppSelector(selectDashboardStatus);
  const error = useAppSelector(selectDashboardError);
  const lowStockProducts = useAppSelector(selectLowStockProducts);
  const dailySales = useAppSelector(selectDailySales);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!metrics) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Control
      </Typography>

      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Ventas Totales"
            value={`$${metrics.totalSales.toLocaleString()}`}
            trend={metrics.salesTrend}
            icon={<AttachMoney />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Productos Vendidos"
            value={metrics.totalProducts}
            trend={metrics.productsTrend}
            icon={<ShoppingCart />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Stock Total"
            value={metrics.totalStock}
            icon={<Inventory />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Promedio de Ventas"
            value={`$${metrics.averageSale.toLocaleString()}`}
            trend={metrics.averageSaleTrend}
            icon={<TrendingUp />}
          />
        </Grid>

        {/* Gráfico de Ventas */}
        <Grid item xs={12} md={8}>
          <SalesChart data={dailySales} />
        </Grid>

        {/* Alertas de Stock Bajo */}
        <Grid item xs={12} md={4}>
          <AlertCard
            title="Productos con Stock Bajo"
            products={lowStockProducts}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;