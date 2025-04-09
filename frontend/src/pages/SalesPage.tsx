import React, { useEffect } from 'react';
import { Container, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSalesOverview,
  fetchSalesTrend,
  fetchProductSales,
  fetchCategorySales,
  fetchPaymentMethods,
  setDateRange,
  selectSalesOverview,
  selectSalesTrend,
  selectProductSales,
  selectCategorySales,
  selectPaymentMethods,
  selectDateRange,
  selectSalesStatus,
  selectSalesError
} from '../features/sales/salesSlice';

import { DateRangePicker } from '../components/sales/DateRangePicker';
import SalesKPICards from '../components/sales/SalesKPICards';
import { SalesTrendChart } from '../components/sales/SalesTrendChart';
import TopProductsTable from '../components/sales/TopProductsTable';
import { SalesDistributionCharts } from '../components/sales/SalesDistributionCharts';

export const SalesPage = () => {
  const dispatch = useAppDispatch();
  const overview = useAppSelector(selectSalesOverview);
  const trendData = useAppSelector(selectSalesTrend);
  const productSales = useAppSelector(selectProductSales);
  const categorySales = useAppSelector(selectCategorySales);
  const paymentMethods = useAppSelector(selectPaymentMethods);
  const dateRange = useAppSelector(selectDateRange);
  const status = useAppSelector(selectSalesStatus);
  const error = useAppSelector(selectSalesError);

  const fetchAllSalesData = () => {
    dispatch(fetchSalesOverview(dateRange));
    dispatch(fetchSalesTrend(dateRange));
    dispatch(fetchProductSales(dateRange));
    dispatch(fetchCategorySales(dateRange));
    dispatch(fetchPaymentMethods(dateRange));
  };

  useEffect(() => {
    fetchAllSalesData();
  }, [dateRange]);

  const handleDateRangeChange = (newDateRange: typeof dateRange) => {
    dispatch(setDateRange(newDateRange));
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <DateRangePicker dateRange={dateRange} onDateChange={handleDateRangeChange} />
      
      {overview && <SalesKPICards data={overview} />}
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          {trendData.length > 0 && <SalesTrendChart data={trendData} />}
        </Grid>

        <Grid item xs={12}>
          {productSales.length > 0 && <TopProductsTable data={productSales} />}
        </Grid>

        <Grid item xs={12}>
          {categorySales.length > 0 && paymentMethods.length > 0 && (
            <SalesDistributionCharts
              categorySales={categorySales}
              paymentMethods={paymentMethods}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};