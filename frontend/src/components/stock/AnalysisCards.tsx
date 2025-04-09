import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Inventory, Warning, RemoveCircle, TrendingUp } from '@mui/icons-material';
import { InventoryAnalysis } from '../../services/api';

interface AnalysisCardsProps {
  data: InventoryAnalysis;
}

const AnalysisCards: React.FC<AnalysisCardsProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Valor Total del Inventario',
      value: formatCurrency(data.totalValue),
      icon: <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main'
    },
    {
      title: 'Productos en Bajo Stock',
      value: formatPercentage(data.lowStockPercentage),
      icon: <Warning sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main'
    },
    {
      title: 'Productos Sin Stock',
      value: data.outOfStockCount.toString(),
      icon: <RemoveCircle sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.main'
    },
    {
      title: 'Productos Sobre Stock',
      value: data.overStockCount.toString(),
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
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

export default AnalysisCards;