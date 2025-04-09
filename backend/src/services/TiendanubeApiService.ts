import axios, { AxiosInstance, AxiosError } from 'axios';

interface TiendanubeConfig {
  storeId: string;
  accessToken: string;
}

interface PaginationInfo {
  next?: string;
  prev?: string;
  total: number;
}

interface TiendanubeResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export class TiendanubeApiService {
  private readonly api: AxiosInstance;
  private readonly baseUrl = 'https://api.tiendanube.com/v1';
  private readonly maxRetries = 3;
  private readonly initialRetryDelay = 1000; // 1 segundo

  constructor(private config: TiendanubeConfig) {
    this.api = axios.create({
      baseURL: `${this.baseUrl}/${config.storeId}`,
      headers: {
        'Authentication': `bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Stock-Live-App/1.0'
      }
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      response => response,
      this.handleApiError.bind(this)
    );
  }

  private async handleApiError(error: AxiosError) {
    if (!error.response) {
      throw new Error('Error de red');
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        throw new Error('Credenciales inválidas');
      case 403:
        throw new Error('Acceso denegado');
      case 404:
        throw new Error('Recurso no encontrado');
      case 429:
        // Implementar reintento con backoff exponencial
        const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
        throw new Error(`Rate limit excedido. Intente nuevamente en ${retryAfter} segundos`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error('Error del servidor de Tiendanube');
      default:
        throw new Error(`Error desconocido: ${status}`);
    }
  }

  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.status === 429 &&
        retryCount < this.maxRetries
      ) {
        const delay = this.initialRetryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithExponentialBackoff(operation, retryCount + 1);
      }
      throw error;
    }
  }

  async getStoreInfo(): Promise<TiendanubeResponse<any>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.get('/');
      return response.data;
    });
  }

  async getProducts(page = 1, per_page = 50): Promise<TiendanubeResponse<any[]>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.get('/products', {
        params: { page, per_page }
      });
      return {
        data: response.data,
        pagination: {
          next: response.headers['next-page'],
          prev: response.headers['prev-page'],
          total: parseInt(response.headers['x-total-count'] || '0')
        }
      };
    });
  }

  async getOrders(page = 1, per_page = 50): Promise<TiendanubeResponse<any[]>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.get('/orders', {
        params: { page, per_page }
      });
      return {
        data: response.data,
        pagination: {
          next: response.headers['next-page'],
          prev: response.headers['prev-page'],
          total: parseInt(response.headers['x-total-count'] || '0')
        }
      };
    });
  }

  async getProduct(productId: string): Promise<TiendanubeResponse<any>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.get(`/products/${productId}`);
      return response.data;
    });
  }

  async getOrder(orderId: string): Promise<TiendanubeResponse<any>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data;
    });
  }

  async updateProductStock(productId: string, variantId: string, stock: number): Promise<TiendanubeResponse<any>> {
    return this.retryWithExponentialBackoff(async () => {
      const response = await this.api.put(`/products/${productId}/variants/${variantId}`, {
        stock
      });
      return response.data;
    });
  }
}