import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SalesPage } from '../SalesPage';
import salesReducer from '../../features/sales/salesSlice';

// Mock de los componentes hijos para aislar las pruebas
jest.mock('../../components/sales/DateRangePicker', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />
}));

jest.mock('../../components/sales/SalesKPICards', () => ({
  __esModule: true,
  default: () => <div data-testid="sales-kpi-cards" />
}));

jest.mock('../../components/sales/SalesTrendChart', () => ({
  SalesTrendChart: () => <div data-testid="sales-trend-chart" />
}));

jest.mock('../../components/sales/TopProductsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="top-products-table" />
}));

jest.mock('../../components/sales/SalesDistributionCharts', () => ({
  SalesDistributionCharts: () => <div data-testid="sales-distribution-charts" />
}));

describe('SalesPage', () => {
  const createMockStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        sales: salesReducer
      },
      preloadedState: {
        sales: {
          overview: null,
          trendData: [],
          productSales: [],
          categorySales: [],
          paymentMethods: [],
          dateRange: { startDate: new Date(), endDate: new Date() },
          status: 'idle',
          error: null,
          ...initialState
        }
      }
    });
  };

  it('muestra el indicador de carga cuando el estado es "loading"', () => {
    const store = createMockStore({ status: 'loading' });
    render(
      <Provider store={store}>
        <SalesPage />
      </Provider>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando hay un error', () => {
    const errorMessage = 'Error al cargar los datos';
    const store = createMockStore({ 
      status: 'failed',
      error: errorMessage
    });

    render(
      <Provider store={store}>
        <SalesPage />
      </Provider>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renderiza todos los componentes cuando los datos están disponibles', async () => {
    const store = createMockStore({
      status: 'succeeded',
      overview: {
        totalRevenue: 100000,
        orderCount: 50,
        avgOrderValue: 2000
      },
      trendData: [{ date: '2023-01-01', value: 1000 }],
      productSales: [{ id: 1, name: 'Producto 1', sales: 100 }],
      categorySales: [{ category: 'Cat 1', total: 500 }],
      paymentMethods: [{ method: 'Credit Card', total: 1000 }]
    });

    render(
      <Provider store={store}>
        <SalesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
      expect(screen.getByTestId('sales-kpi-cards')).toBeInTheDocument();
      expect(screen.getByTestId('sales-trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('top-products-table')).toBeInTheDocument();
      expect(screen.getByTestId('sales-distribution-charts')).toBeInTheDocument();
    });
  });
});