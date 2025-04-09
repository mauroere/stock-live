import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

interface KPICardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
}

export const KPICard = ({ title, value, isCurrency = false }: KPICardProps) => {
  const formattedValue = isCurrency ? formatCurrency(value) : value.toLocaleString();

  return (
    <Card sx={{ height: '100%', minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6" component="div" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {formattedValue}
        </Typography>
      </CardContent>
    </Card>
  );
};