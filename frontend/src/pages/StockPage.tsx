import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import ProductTable from '../components/stock/ProductTable';
import AnalysisCards from '../components/stock/AnalysisCards';
import StockCharts from '../components/stock/StockCharts';
import {
  fetchProducts,
  fetchInventoryAnalysis,
  updateProductCost,
  setPage,
  setFilters,
  selectStock,
  selectProducts,
  selectAnalysisData,
  selectPagination,
  selectFilters,
  selectStatus
} from '../features/stock/stockSlice';
import { AppDispatch } from '../app/store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StockPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = React.useState(0);

  const products = useSelector(selectProducts);
  const analysisData = useSelector(selectAnalysisData);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const status = useSelector(selectStatus);

  useEffect(() => {
    // Cargar datos iniciales
    dispatch(fetchProducts());
    dispatch(fetchInventoryAnalysis());
  }, [dispatch]);

  useEffect(() => {
    // Recargar productos cuando cambian los filtros o la página
    dispatch(fetchProducts());
  }, [dispatch, pagination.page, filters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Actualizar filtros según la pestaña seleccionada
    const statusFilters = {
      0: '', // Visión General - todos
      1: 'low', // Bajo Stock
      2: 'out', // Sin Stock
      3: 'over', // Sobre Stock
      4: '' // Todos los Productos
    };
    dispatch(setFilters({ status: statusFilters[newValue as keyof typeof statusFilters] }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleCostUpdate = (productId: number, newCost: number) => {
    dispatch(updateProductCost({ productId, cost: newCost }));
  };

  if (status === 'loading' && !products.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3 }}>
        Análisis de Inventario
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="stock analysis tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Visión General" />
          <Tab label="Bajo Stock" />
          <Tab label="Sin Stock" />
          <Tab label="Sobre Stock" />
          <Tab label="Todos los Productos" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {analysisData && (
          <>
            <AnalysisCards data={analysisData} />
            <Box sx={{ mt: 4 }}>
              <StockCharts data={analysisData} />
            </Box>
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProductTable
          products={products}
          totalCount={pagination.total}
          isLoading={status === 'loading'}
          paginationState={pagination}
          filterState={filters}
          onPageChange={handlePageChange}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          onFilterChange={handleFilterChange}
          onCostUpdate={handleCostUpdate}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ProductTable
          products={products}
          totalCount={pagination.total}
          isLoading={status === 'loading'}
          paginationState={pagination}
          filterState={filters}
          onPageChange={handlePageChange}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          onFilterChange={handleFilterChange}
          onCostUpdate={handleCostUpdate}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ProductTable
          products={products}
          totalCount={pagination.total}
          isLoading={status === 'loading'}
          paginationState={pagination}
          filterState={filters}
          onPageChange={handlePageChange}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          onFilterChange={handleFilterChange}
          onCostUpdate={handleCostUpdate}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <ProductTable
          products={products}
          totalCount={pagination.total}
          isLoading={status === 'loading'}
          paginationState={pagination}
          filterState={filters}
          onPageChange={handlePageChange}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          onFilterChange={handleFilterChange}
          onCostUpdate={handleCostUpdate}
        />
      </TabPanel>
    </Container>
  );
};

export default StockPage;