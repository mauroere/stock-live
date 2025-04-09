import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { api } from '../../services/api';

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  inventoryValue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  sku: string;
}

interface TopSellingProduct {
  tiendanubeProductId: number;
  totalSold: number;
  Product: {
    name: string;
    sku: string;
  };
}

interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  lowStockProducts: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
  dailySales: DailySales[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  lowStockProducts: [],
  topSellingProducts: [],
  dailySales: [],
  status: 'idle',
  error: null
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.metrics = action.payload.metrics;
        state.lowStockProducts = action.payload.lowStockProducts;
        state.topSellingProducts = action.payload.topSellingProducts;
        state.dailySales = action.payload.dailySales;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al cargar los datos del dashboard';
      });
  },
});

export const selectDashboardMetrics = (state: RootState) => state.dashboard.metrics;
export const selectLowStockProducts = (state: RootState) => state.dashboard.lowStockProducts;
export const selectTopSellingProducts = (state: RootState) => state.dashboard.topSellingProducts;
export const selectDailySales = (state: RootState) => state.dashboard.dailySales;
export const selectDashboardStatus = (state: RootState) => state.dashboard.status;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

export default dashboardSlice.reducer;