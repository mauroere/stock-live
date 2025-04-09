import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';

export class DashboardController {
  // Obtener métricas generales
  static async getMetrics(req: Request, res: Response) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Métricas de órdenes
      const orderMetrics = await Order.findAll({
        where: {
          createdAtApi: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'totalOrders'],
          [Order.sequelize!.fn('SUM', Order.sequelize!.col('total')), 'totalRevenue']
        ]
      });

      // Valor promedio de orden
      const averageOrderValue = orderMetrics[0].get('totalRevenue') / orderMetrics[0].get('totalOrders');

      // Valor total del inventario
      const inventoryValue = await Product.sum('price * stock');

      // Productos con stock bajo
      const lowStockProducts = await Product.findAll({
        where: {
          stock: {
            [Op.lt]: 5 // Umbral de stock bajo
          }
        },
        attributes: ['id', 'name', 'stock', 'sku'],
        limit: 10
      });

      // Productos más vendidos
      const topSellingProducts = await OrderItem.findAll({
        attributes: [
          'tiendanubeProductId',
          [OrderItem.sequelize!.fn('SUM', OrderItem.sequelize!.col('quantity')), 'totalSold']
        ],
        include: [{
          model: Product,
          attributes: ['name', 'sku']
        }],
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: ['tiendanubeProductId', 'Product.id'],
        order: [[OrderItem.sequelize!.fn('SUM', OrderItem.sequelize!.col('quantity')), 'DESC']],
        limit: 5
      });

      // Tendencias de ventas diarias
      const dailySales = await Order.findAll({
        attributes: [
          [Order.sequelize!.fn('DATE', Order.sequelize!.col('createdAtApi')), 'date'],
          [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'orders'],
          [Order.sequelize!.fn('SUM', Order.sequelize!.col('total')), 'revenue']
        ],
        where: {
          createdAtApi: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: [Order.sequelize!.fn('DATE', Order.sequelize!.col('createdAtApi'))],
        order: [[Order.sequelize!.fn('DATE', Order.sequelize!.col('createdAtApi')), 'ASC']]
      });

      res.json({
        metrics: {
          totalOrders: orderMetrics[0].get('totalOrders'),
          totalRevenue: orderMetrics[0].get('totalRevenue'),
          averageOrderValue,
          inventoryValue
        },
        lowStockProducts,
        topSellingProducts,
        dailySales
      });

    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      res.status(500).json({ error: 'Error al obtener métricas del dashboard' });
    }
  }
}