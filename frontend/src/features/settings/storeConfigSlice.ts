import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi, saveConfigApi, testConnectionApi } from '../../services/api';

interface StoreConfig {
  tiendanubeStoreId: string;
  tiendanubeApiKey: string;
  lowStockThresholdValue: number;
  overStockThresholdValue: number;
}

interface StoreConfigState {
  configData: StoreConfig | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  testConnectionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  testConnectionError: string | null;
}

const initialState: StoreConfigState = {
  configData: null,
  status: 'idle',
  error: null,
  testConnectionStatus: 'idle',
  testConnectionError: null,
};

export const fetchConfig = createAsyncThunk(
  'storeConfig/fetchConfig',
  async () => {
    const response = await getConfigApi();
    return response.data;
  }
);

export const saveConfig = createAsyncThunk(
  'storeConfig/saveConfig',
  async (configData: StoreConfig) => {
    const response = await saveConfigApi(configData);
    return response.data;
  }
);

export const testConnection = createAsyncThunk(
  'storeConfig/testConnection',
  async (_, { getState }) => {
    const response = await testConnectionApi();
    return response.data;
  }
);

const storeConfigSlice = createSlice({
  name: 'storeConfig',
  initialState,
  reducers: {
    resetTestConnection: (state) => {
      state.testConnectionStatus = 'idle';
      state.testConnectionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Config
      .addCase(fetchConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.configData = action.payload;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al cargar la configuración';
      })
      // Save Config
      .addCase(saveConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.configData = action.payload;
      })
      .addCase(saveConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al guardar la configuración';
      })
      // Test Connection
      .addCase(testConnection.pending, (state) => {
        state.testConnectionStatus = 'loading';
      })
      .addCase(testConnection.fulfilled, (state) => {
        state.testConnectionStatus = 'succeeded';
        state.testConnectionError = null;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.testConnectionStatus = 'failed';
        state.testConnectionError = action.error.message || 'Error al probar la conexión';
      });
  },
});

export const { resetTestConnection } = storeConfigSlice.actions;
export default storeConfigSlice.reducer;