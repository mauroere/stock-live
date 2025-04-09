import { Worker } from 'bullmq';
import { redisConnection } from './setup';
import { StoreConfig } from '../models/StoreConfig';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { TiendanubeApiService } from '../services/TiendanubeApiService';

const processSyncJob = async (job) => {
  const { storeConfigId } = job.data;
  
  try {
    // Actualizar estado de sincronización a 'IN_PROGRESS'
    await StoreConfig.update(
      { lastSyncStatus: 'IN_PROGRESS' },
      { where: { id: storeConfigId } }
    );

    // Obtener configuración de la tienda
    const storeConfig = await StoreConfig.findByPk(storeConfigId);
    if (!storeConfig) {
      throw new Error(`StoreConfig not found for id: ${storeConfigId}`);
    }

    // Instanciar el servicio de API de Tiendanube
    const apiService = new TiendanubeApiService(storeConfig);

    // Sincronizar categorías
    const categories = await apiService.getCategories();
    for (const category of categories) {
      await Category.upsert({
        tiendanubeCategoryId: category.id,
        storeConfigId,
        name: category.name
      });
    }

    // Sincronizar productos
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const products = await apiService.getProducts({ page });
      if (!products.length) {
        hasMore = false;
        continue;
      }

      // Procesar productos en lotes
      const productsToUpsert = products.map(product => ({
        tiendanubeProductId: product.id,
        storeConfigId,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        price: product.price,
        cost: product.cost || 0,
        imageUrl: product.image_url,
        categoryTiendanubeId: product.category_id,
        isVariant: false,
        createdAtApi: new Date(product.created_at),
        updatedAtApi: new Date(product.updated_at),
        localUpdatedAt: new Date()
      }));

      await Product.bulkCreate(productsToUpsert, {
        updateOnDuplicate: [
          'name', 'sku', 'stock', 'price', 'cost', 'imageUrl',
          'categoryTiendanubeId', 'updatedAtApi', 'localUpdatedAt'
        ]
      });

      // Procesar variantes
      for (const product of products) {
        if (product.variants) {
          const variantsToUpsert = product.variants.map(variant => ({
            tiendanubeProductId: variant.id,
            storeConfigId,
            name: `${product.name} - ${variant.name}`,
            sku: variant.sku,
            stock: variant.stock,
            price: variant.price,
            cost: variant.cost || 0,
            imageUrl: variant.image_url,
            categoryTiendanubeId: product.category_id,
            isVariant: true,
            parentTiendanubeProductId: product.id,
            createdAtApi: new Date(variant.created_at),
            updatedAtApi: new Date(variant.updated_at),
            localUpdatedAt: new Date()
          }));

          await Product.bulkCreate(variantsToUpsert, {
            updateOnDuplicate: [
              'name', 'sku', 'stock', 'price', 'cost', 'imageUrl',
              'categoryTiendanubeId', 'updatedAtApi', 'localUpdatedAt'
            ]
          });
        }
      }

      page++;
    }

    // Sincronizar órdenes recientes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    page = 1;
    hasMore = true;
    while (hasMore) {
      const orders = await apiService.getOrders({
        page,
        created_at_min: thirtyDaysAgo.toISOString()
      });

      if (!orders.length) {
        hasMore = false;
        continue;
      }

      for (const order of orders) {
        // Crear o actualizar orden
        const [orderRecord] = await Order.upsert({
          tiendanubeOrderId: order.id,
          storeConfigId,
          status: order.status,
          total: order.total,
          createdAtApi: new Date(order.created_at),
          updatedAtApi: new Date(order.updated_at),
          localUpdatedAt: new Date()
        });

        // Procesar items de la orden
        for (const item of order.items) {
          await OrderItem.upsert({
            orderId: orderRecord.id,
            tiendanubeProductId: item.product_id,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          });
        }
      }

      page++;
    }

    // Actualizar estado de sincronización a 'SUCCESS'
    await StoreConfig.update(
      {
        lastSyncStatus: 'SUCCESS',
        lastSyncAt: new Date()
      },
      { where: { id: storeConfigId } }
    );

  } catch (error) {
    console.error(`Sync failed for store ${storeConfigId}:`, error);
    
    // Actualizar estado de sincronización a 'FAILED'
    await StoreConfig.update(
      { lastSyncStatus: 'FAILED' },
      { where: { id: storeConfigId } }
    );

    throw error;
  }
};

// Crear el worker
export const syncWorker = new Worker('syncQueue', processSyncJob, {
  connection: redisConnection,
  concurrency: 1, // Procesar un job a la vez
});

// Manejar eventos del worker
syncWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

syncWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});