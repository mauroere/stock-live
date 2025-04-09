import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { AttachMoney, ShoppingCart, TrendingUp, CompareArrows } from '@mui/icons-material';
import { SalesMetrics } from '../../features/sales/salesSlice';

interface SalesKPICardsProps {
  data: SalesMetrics;
}

const SalesKPICards: React.FC<SalesKPICardsProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(data.totalRevenue),
      comparison: data.comparisonPercentage ? formatPercentage(data.comparisonPercentage) : undefined,
      icon: <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main'
    },
    {
      title: 'Cantidad de Órdenes',
      value: data.orderCount.toString(),
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main'
    },
    {
      title: 'Valor Promedio por Orden',
      value: formatCurrency(data.avgOrderValue),
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2
                }}
              >
                {card.icon}
                {card.comparison && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: card.comparison.startsWith('+') ? 'success.main' : 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <CompareArrows fontSize="small" />
                    {card.comparison}
                  </Typography>
                )}
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {card.value}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SalesKPICards;