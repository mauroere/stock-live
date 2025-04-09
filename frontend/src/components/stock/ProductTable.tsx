import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Pagination,
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Edit } from '@mui/icons-material';
import { Product, ProductFilters } from '../../services/api';

interface ProductTableProps {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  paginationState: {
    page: number;
    limit: number;
  };
  filterState: ProductFilters;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCostUpdate?: (productId: number, newCost: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalCount,
  isLoading,
  paginationState,
  filterState,
  onPageChange,
  onSortChange,
  onFilterChange,
  onCostUpdate
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out':
        return 'error';
      case 'low':
        return 'warning';
      case 'over':
        return 'info';
      case 'ok':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      out: 'Sin Stock',
      low: 'Bajo Stock',
      over: 'Sobre Stock',
      ok: 'OK'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleSortClick = (column: string) => {
    const newOrder = filterState.sortBy === column && filterState.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ sortBy: column, sortOrder: newOrder });
  };

  const renderSortIcon = (column: string) => {
    if (filterState.sortBy !== column) return null;
    return filterState.sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Buscar"
          size="small"
          value={filterState.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={filterState.category}
            label="Categoría"
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="electronics">Electrónicos</MenuItem>
            <MenuItem value="clothing">Ropa</MenuItem>
            <MenuItem value="accessories">Accesorios</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterState.status}
            label="Estado"
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="out">Sin Stock</MenuItem>
            <MenuItem value="low">Bajo Stock</MenuItem>
            <MenuItem value="over">Sobre Stock</MenuItem>
            <MenuItem value="ok">OK</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell onClick={() => handleSortClick('name')} sx={{ cursor: 'pointer' }}>
                Nombre {renderSortIcon('name')}
              </TableCell>
              <TableCell onClick={() => handleSortClick('sku')} sx={{ cursor: 'pointer' }}>
                SKU {renderSortIcon('sku')}
              </TableCell>
              <TableCell onClick={() => handleSortClick('currentStock')} sx={{ cursor: 'pointer' }}>
                Stock Actual {renderSortIcon('currentStock')}
              </TableCell>
              <TableCell onClick={() => handleSortClick('price')} sx={{ cursor: 'pointer' }}>
                Precio {renderSortIcon('price')}
              </TableCell>
              <TableCell onClick={() => handleSortClick('cost')} sx={{ cursor: 'pointer' }}>
                Costo {renderSortIcon('cost')}
              </TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography>Cargando...</Typography>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography>No se encontraron productos</Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {/* Placeholder para imagen */}
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      IMG
                    </Box>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.currentStock}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ${product.cost.toFixed(2)}
                      {onCostUpdate && (
                        <Tooltip title="Editar costo">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newCost = prompt('Ingrese el nuevo costo:', product.cost.toString());
                              if (newCost && !isNaN(Number(newCost))) {
                                onCostUpdate(product.id, Number(newCost));
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>${(product.currentStock * product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(product.status)}
                      color={getStatusColor(product.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {/* Placeholder para acciones adicionales */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(totalCount / paginationState.limit)}
          page={paginationState.page}
          onChange={(_, page) => onPageChange(page)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ProductTable;