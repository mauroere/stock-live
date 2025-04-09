import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { api } from '../../services/api';

export interface SalesMetrics {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  comparisonPercentage?: number;
}

export interface ProductSale {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
  sku: string;
}

export interface CategorySale {
  categoryId: number;
  name: string;
  revenue: number;
  orderCount: number;
}

export interface PaymentMethodSale {
  method: string;
  count: number;
  amount: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface SalesState {
  overviewData: SalesMetrics | null;
  trendData: SalesTrend[];
  productSales: ProductSale[];
  categorySales: CategorySale[];
  paymentMethods: PaymentMethodSale[];
  dateRange: DateRange;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SalesState = {
  overviewData: null,
  trendData: [],
  productSales: [],
  categorySales: [],
  paymentMethods: [],
  dateRange: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  status: 'idle',
  error: null
};

export const fetchSalesOverview = createAsyncThunk(
  'sales/fetchOverview',
  async (dateRange: DateRange) => {
    const response = await api.get('/sales/overview', { params: dateRange });
    return response.data;
  }
);

export const fetchSalesTrend = createAsyncThunk(
  'sales/fetchTrend',
  async (dateRange: DateRange) => {
    const response = await api.get('/sales/trend', { params: dateRange });
    return response.data;
  }
);

export const fetchProductSales = createAsyncThunk(
  'sales/fetchProductSales',
  async (dateRange: DateRange) => {
    const response = await api.get('/sales/by-product', { params: dateRange });
    return response.data;
  }
);

export const fetchCategorySales = createAsyncThunk(
  'sales/fetchCategorySales',
  async (dateRange: DateRange) => {
    const response = await api.get('/sales/by-category', { params: dateRange });
    return response.data;
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'sales/fetchPaymentMethods',
  async (dateRange: DateRange) => {
    const response = await api.get('/sales/by-payment', { params: dateRange });
    return response.data;
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchSalesOverview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSalesOverview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.overviewData = action.payload;
      })
      .addCase(fetchSalesOverview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al cargar el resumen de ventas';
      })
      // Trend
      .addCase(fetchSalesTrend.fulfilled, (state, action) => {
        state.trendData = action.payload;
      })
      // Product Sales
      .addCase(fetchProductSales.fulfilled, (state, action) => {
        state.productSales = action.payload;
      })
      // Category Sales
      .addCase(fetchCategorySales.fulfilled, (state, action) => {
        state.categorySales = action.payload;
      })
      // Payment Methods
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
      });
  },
});

export const { setDateRange } = salesSlice.actions;

export const selectSalesOverview = (state: RootState) => state.sales.overviewData;
export const selectSalesTrend = (state: RootState) => state.sales.trendData;
export const selectProductSales = (state: RootState) => state.sales.productSales;
export const selectCategorySales = (state: RootState) => state.sales.categorySales;
export const selectPaymentMethods = (state: RootState) => state.sales.paymentMethods;
export const selectDateRange = (state: RootState) => state.sales.dateRange;
export const selectSalesStatus = (state: RootState) => state.sales.status;
export const selectSalesError = (state: RootState) => state.sales.error;

export default salesSlice.reducer;