import { configureStore } from '@reduxjs/toolkit';
import salesReducer, {
  fetchSalesOverview,
  fetchSalesTrend,
  fetchProductSales,
  fetchCategorySales,
  fetchPaymentMethods,
  setDateRange
} from '../salesSlice';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Configuración del servidor mock
const server = setupServer(
  rest.get('/api/sales/overview', (req, res, ctx) => {
    return res(ctx.json({
      totalRevenue: 100000,
      comparisonPercentage: 10,
      orderCount: 50,
      avgOrderValue: 2000
    }));
  }),
  rest.get('/api/sales/trend', (req, res, ctx) => {
    return res(ctx.json([
      { date: '2023-01-01', revenue: 1000 },
      { date: '2023-01-02', revenue: 1500 }
    ]));
  }),
  rest.get('/api/sales/products', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Producto 1', sales: 100, revenue: 5000 },
      { id: 2, name: 'Producto 2', sales: 80, revenue: 4000 }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('salesSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        sales: salesReducer
      }
    });
  });

  it('maneja correctamente la acción setDateRange', () => {
    const dateRange = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31')
    };

    store.dispatch(setDateRange(dateRange));
    const state = store.getState().sales;

    expect(state.dateRange).toEqual(dateRange);
  });

  it('maneja correctamente la obtención exitosa de datos de overview', async () => {
    const result = await store.dispatch(fetchSalesOverview({
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31')
    }));

    expect(result.payload).toEqual({
      totalRevenue: 100000,
      comparisonPercentage: 10,
      orderCount: 50,
      avgOrderValue: 2000
    });

    const state = store.getState().sales;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
  });

  it('maneja correctamente los errores en la obtención de datos', async () => {
    server.use(
      rest.get('/api/sales/overview', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await store.dispatch(fetchSalesOverview({
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31')
    }));

    const state = store.getState().sales;
    expect(state.status).toBe('failed');
    expect(state.error).toBeTruthy();
  });

  it('actualiza correctamente el estado durante la carga de datos', () => {
    store.dispatch(fetchSalesTrend({
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31')
    }));

    const loadingState = store.getState().sales;
    expect(loadingState.status).toBe('loading');
  });

  it('integra correctamente múltiples llamadas a la API', async () => {
    const dateRange = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31')
    };

    await Promise.all([
      store.dispatch(fetchSalesOverview(dateRange)),
      store.dispatch(fetchSalesTrend(dateRange)),
      store.dispatch(fetchProductSales(dateRange))
    ]);

    const state = store.getState().sales;
    expect(state.overview).toBeTruthy();
    expect(state.trendData.length).toBeGreaterThan(0);
    expect(state.productSales.length).toBeGreaterThan(0);
  });
});