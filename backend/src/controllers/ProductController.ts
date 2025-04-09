import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models/Product';
import { StoreConfiguration } from '../models/StoreConfiguration';
import { Sale } from '../models/Sale';

export class ProductController {
  async getProducts(req: Request, res: Response) {
    try {
      const storeConfigId = req.user.id;
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'ASC',
        search = '',
        categoryFilter,
        statusFilter
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = { storeConfigId };

      // Aplicar filtro de búsqueda
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } }
        ];
      }

      // Aplicar filtro de categoría
      if (categoryFilter) {
        where.categoryId = categoryFilter;
      }

      // Obtener configuración de la tienda para los umbrales
      const storeConfig = await StoreConfiguration.findByPk(storeConfigId);
      if (!storeConfig) {
        return res.status(404).json({ message: 'Configuración de tienda no encontrada' });
      }

      // Calcular ventas promedio diarias para cada producto
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesData = await Sale.findAll({
        where: {
          productId: { [Op.col]: 'Product.id' },
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'productId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        ],
        group: ['productId']
      });

      // Crear mapa de ventas promedio por producto
      const avgDailySales = new Map();
      salesData.forEach((sale: any) => {
        avgDailySales.set(
          sale.productId,
          sale.getDataValue('totalSold') / 30
        );
      });

      // Aplicar filtro de estado
      if (statusFilter) {
        switch (statusFilter) {
          case 'low':
            where[Op.and] = [
              { stock: { [Op.gt]: 0 } },
              { stock: { [Op.lte]: storeConfig.lowStockThresholdValue } }
            ];
            break;
          case 'out':
            where.stock = 0;
            break;
          case 'over':
            // Se filtrará después de obtener los productos
            break;
          case 'ok':
            where[Op.and] = [
              { stock: { [Op.gt]: storeConfig.lowStockThresholdValue } },
              { stock: { [Op.gt]: 0 } }
            ];
            break;
        }
      }

      // Obtener productos con paginación
      const { rows: products, count: totalCount } = await Product.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: Number(limit),
        offset
      });

      // Filtrar productos con exceso de stock si es necesario
      let filteredProducts = products;
      if (statusFilter === 'over') {
        filteredProducts = products.filter(product => {
          const avgDailySale = avgDailySales.get(product.id) || 0;
          const coverageDays = avgDailySale > 0 ? product.stock / avgDailySale : Infinity;
          return coverageDays > storeConfig.overStockThresholdValue;
        });
      }

      res.json({
        products: filteredProducts,
        totalCount: statusFilter === 'over' ? filteredProducts.length : totalCount
      });
    } catch (error) {
      console.error('Error en getProducts:', error);
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  }

  async getInventoryAnalysis(req: Request, res: Response) {
    try {
      const storeConfigId = req.user.id;

      // Obtener todos los productos
      const products = await Product.findAll({
        where: { storeConfigId }
      });

      // Calcular métricas básicas
      const totalValue = products.reduce((acc, product) => {
        return acc + (product.price * product.stock);
      }, 0);

      const totalCost = products.reduce((acc, product) => {
        return acc + (product.cost * product.stock);
      }, 0);

      // Obtener configuración de la tienda
      const storeConfig = await StoreConfiguration.findByPk(storeConfigId);
      if (!storeConfig) {
        return res.status(404).json({ message: 'Configuración de tienda no encontrada' });
      }

      // Calcular conteo por estado
      const countByStatus = {
        low: 0,
        out: 0,
        over: 0,
        ok: 0
      };

      // Obtener ventas de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sales = await Sale.findAll({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          'productId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
          [sequelize.fn('SUM', sequelize.col('quantity * cost')), 'totalCost']
        ],
        group: ['productId']
      });

      // Crear mapa de ventas por producto
      const salesByProduct = new Map();
      sales.forEach((sale: any) => {
        salesByProduct.set(sale.productId, {
          quantity: sale.getDataValue('totalSold'),
          cost: sale.getDataValue('totalCost')
        });
      });

      // Calcular rotación y clasificar productos
      let totalRevenue = 0;
      const productAnalysis = products.map(product => {
        const salesData = salesByProduct.get(product.id) || { quantity: 0, cost: 0 };
        const avgDailySale = salesData.quantity / 30;
        const coverageDays = avgDailySale > 0 ? product.stock / avgDailySale : Infinity;

        // Clasificar estado del producto
        if (product.stock === 0) {
          countByStatus.out++;
        } else if (product.stock <= storeConfig.lowStockThresholdValue) {
          countByStatus.low++;
        } else if (coverageDays > storeConfig.overStockThresholdValue) {
          countByStatus.over++;
        } else {
          countByStatus.ok++;
        }

        totalRevenue += product.price * salesData.quantity;

        return {
          id: product.id,
          name: product.name,
          revenue: product.price * salesData.quantity,
          stockTurnover: salesData.cost / (product.cost * product.stock || 1)
        };
      });

      // Análisis ABC (basado en ingresos)
      const sortedProducts = productAnalysis
        .sort((a, b) => b.revenue - a.revenue);

      const totalRevenueSum = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);
      let accumulatedRevenue = 0;
      const abcAnalysis = {
        A: 0,
        B: 0,
        C: 0
      };

      sortedProducts.forEach(product => {
        accumulatedRevenue += product.revenue;
        const percentage = accumulatedRevenue / totalRevenueSum * 100;

        if (percentage <= 80) abcAnalysis.A++;
        else if (percentage <= 95) abcAnalysis.B++;
        else abcAnalysis.C++;
      });

      // Calcular rotación de inventario promedio
      const averageStockTurnover = productAnalysis.reduce((sum, p) => sum + p.stockTurnover, 0) / productAnalysis.length;

      res.json({
        metrics: {
          totalValue,
          totalCost,
          countByStatus,
          averageStockTurnover,
          abcAnalysis
        }
      });
    } catch (error) {
      console.error('Error en getInventoryAnalysis:', error);
      res.status(500).json({ message: 'Error al obtener análisis de inventario' });
    }
  }

  async updateProductCost(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { cost } = req.body;
      const storeConfigId = req.user.id;

      if (!cost || cost < 0) {
        return res.status(400).json({ message: 'Costo inválido' });
      }

      const product = await Product.findOne({
        where: { id: productId, storeConfigId }
      });

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await product.update({ cost });

      res.json(product);
    } catch (error) {
      console.error('Error en updateProductCost:', error);
      res.status(500).json({ message: 'Error al actualizar el costo del producto' });
    }
  }
}