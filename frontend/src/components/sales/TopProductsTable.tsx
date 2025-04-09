import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { ProductSale } from '../../features/sales/salesSlice';

interface TopProductsTableProps {
  data: ProductSale[];
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Productos Más Vendidos
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Ingresos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell component="th" scope="row">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopProductsTable;