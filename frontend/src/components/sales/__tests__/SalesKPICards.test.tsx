import React from 'react';
import { render, screen } from '@testing-library/react';
import SalesKPICards from '../SalesKPICards';

describe('SalesKPICards', () => {
  const mockData = {
    totalRevenue: 150000,
    comparisonPercentage: 15.5,
    orderCount: 100,
    avgOrderValue: 1500
  };

  it('renderiza correctamente todos los KPIs', () => {
    render(<SalesKPICards data={mockData} />);
    
    // Verifica que se muestren los títulos de las tarjetas
    expect(screen.getByText('Ingresos Totales')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Valor Promedio por Orden')).toBeInTheDocument();

    // Verifica los valores formateados
    expect(screen.getByText('$ 150.000,00')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('$ 1.500,00')).toBeInTheDocument();
  });

  it('muestra el porcentaje de comparación cuando está disponible', () => {
    render(<SalesKPICards data={mockData} />);
    expect(screen.getByText('+15.5%')).toBeInTheDocument();
  });

  it('maneja correctamente la ausencia del porcentaje de comparación', () => {
    const dataWithoutComparison = {
      ...mockData,
      comparisonPercentage: undefined
    };
    render(<SalesKPICards data={dataWithoutComparison} />);
    expect(screen.queryByText(/\+15\.5%/)).not.toBeInTheDocument();
  });

  it('aplica el formato de moneda correcto para Argentina', () => {
    render(<SalesKPICards data={mockData} />);
    const formattedRevenue = screen.getByText('$ 150.000,00');
    const formattedAvgOrder = screen.getByText('$ 1.500,00');
    
    expect(formattedRevenue).toBeInTheDocument();
    expect(formattedAvgOrder).toBeInTheDocument();
  });
});