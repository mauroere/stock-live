import axios from 'axios';
import { store } from '../app/store';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autorización
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// Configuración de la tienda
export const getConfigApi = () => api.get<StoreConfig>('/store/config');

export const saveConfigApi = (data: StoreConfig) => api.post<StoreConfig>('/store/config', data);

export const testConnectionApi = () => api.post('/store/test-connection');

// Perfil de usuario
export const getUserProfileApi = () => api.get<UserProfile>('/users/profile');

export const updateUserProfileApi = (data: { name: string }) =>
  api.put<UserProfile>('/users/profile', data);

// Interfaces para productos e inventario
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  price: number;
  cost: number;
  category: string;
  status: 'out' | 'low' | 'over' | 'ok';
}

export interface InventoryAnalysis {
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

// Interfaces de configuración y usuario
export interface StoreConfig {
  tiendanubeStoreId: string;
  tiendanubeApiKey: string;
  lowStockThresholdValue: number;
  overStockThresholdValue: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Servicios de productos e inventario
export const getProductsApi = async (params: ProductFilters) => {
  const response = await api.get<{ products: Product[]; total: number }>('/products', { params });
  return response.data;
};

export const getInventoryAnalysisApi = async () => {
  const response = await api.get<InventoryAnalysis>('/products/analysis');
  return response.data;
};

export const updateProductCostApi = async (productId: number, cost: number) => {
  const response = await api.put<Product>(`/products/${productId}/cost`, { cost });
  return response.data;
};

export default api;