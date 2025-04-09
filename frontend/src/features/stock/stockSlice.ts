import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { getProductsApi, getInventoryAnalysisApi, updateProductCostApi } from '../../services/api';

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  price: number;
  cost: number;
  category: string;
  status: 'out' | 'low' | 'over' | 'ok';
}

interface AnalysisData {
  totalValue: number;
  lowStockPercentage: number;
  outOfStockCount: number;
  overStockCount: number;
  countByStatus: {
    out: number;
    low: number;
    over: number;
    ok: number;
  };
  abcAnalysis?: {
    a: number;
    b: number;
    c: number;
  };
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface FilterState {
  search: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface StockState {
  products: Product[];
  analysisData: AnalysisData | null;
  pagination: PaginationState;
  filters: FilterState;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StockState = {
  products: [],
  analysisData: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  filters: {
    search: '',
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  status: 'idle',
  error: null
};

export const fetchProducts = createAsyncThunk(
  'stock/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { pagination, filters } = state.stock;
      const response = await getProductsApi({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      return response;
    } catch (error) {
      return rejectWithValue('Error al obtener productos');
    }
  }
);

export const fetchInventoryAnalysis = createAsyncThunk(
  'stock/fetchInventoryAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInventoryAnalysisApi();
      return response;
    } catch (error) {
      return rejectWithValue('Error al obtener análisis de inventario');
    }
  }
);

export const updateProductCost = createAsyncThunk(
  'stock/updateProductCost',
  async ({ productId, cost }: { productId: number; cost: number }, { rejectWithValue }) => {
    try {
      const response = await updateProductCostApi(productId, cost);
      return response;
    } catch (error) {
      return rejectWithValue('Error al actualizar el costo del producto');
    }
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryAnalysis.fulfilled, (state, action) => {
        state.analysisData = action.payload;
      })
      .addCase(updateProductCost.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        const index = state.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      });
  }
});

export const { setPage, setFilters, resetFilters } = stockSlice.actions;

export const selectStock = (state: RootState) => state.stock;
export const selectProducts = (state: RootState) => state.stock.products;
export const selectAnalysisData = (state: RootState) => state.stock.analysisData;
export const selectPagination = (state: RootState) => state.stock.pagination;
export const selectFilters = (state: RootState) => state.stock.filters;
export const selectStatus = (state: RootState) => state.stock.status;

export default stockSlice.reducer;