import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { LowStockProduct } from '../../features/dashboard/dashboardSlice';

interface AlertCardProps {
  title: string;
  products: LowStockProduct[];
}

export const AlertCard = ({ title, products }: AlertCardProps) => {
  return (
    <Card sx={{ height: '100%', minWidth: 300 }}>
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          color="warning.main"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <Warning />
          {title}
        </Typography>
        <List dense>
          {products.map((product) => (
            <ListItem key={product.id}>
              <ListItemText
                primary={product.name}
                secondary={`SKU: ${product.sku} - Stock: ${product.stock}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};