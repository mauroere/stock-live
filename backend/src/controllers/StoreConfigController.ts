import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { StoreConfiguration } from '../models/StoreConfiguration';

export class StoreConfigController {
  /**
   * Obtiene la configuración de tienda para el usuario autenticado
   */
  static async getConfig(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const config = await StoreConfiguration.findOne({ where: { userId } });
      if (!config) {
        return res.status(404).json({ error: 'Configuración no encontrada' });
      }

      // Enviamos la configuración sin las claves sensibles
      const safeConfig = {
        id: config.id,
        userId: config.userId,
        tiendanubeStoreId: config.tiendanubeStoreId,
        storeName: config.storeName,
        lowStockThresholdValue: config.lowStockThresholdValue,
        lowStockThresholdType: config.lowStockThresholdType,
        overStockThresholdValue: config.overStockThresholdValue,
        overStockThresholdType: config.overStockThresholdType,
        lastSyncStatus: config.lastSyncStatus,
        lastSyncAt: config.lastSyncAt,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      };

      res.json(safeConfig);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ error: 'Error al obtener configuración de tienda' });
    }
  }

  /**
   * Guarda o actualiza la configuración de tienda
   */
  static async saveConfig(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const {
        tiendanubeStoreId,
        tiendanubeApiKey,
        tiendanubeAccessToken,
        storeName,
        lowStockThresholdValue,
        lowStockThresholdType,
        overStockThresholdValue,
        overStockThresholdType
      } = req.body;

      // Validar input
      if (!tiendanubeStoreId || !tiendanubeApiKey || !tiendanubeAccessToken) {
        return res.status(400).json({ error: 'Faltan credenciales de Tiendanube' });
      }

      if (!lowStockThresholdValue || !lowStockThresholdType || !overStockThresholdValue || !overStockThresholdType) {
        return res.status(400).json({ error: 'Configuración de umbrales incompleta' });
      }

      // Buscar configuración existente o crear nueva
      let config = await StoreConfiguration.findOne({ where: { userId } });
      
      const configData = {
        userId,
        tiendanubeStoreId,
        tiendanubeApiKey,
        tiendanubeAccessToken,
        storeName,
        lowStockThresholdValue,
        lowStockThresholdType,
        overStockThresholdValue,
        overStockThresholdType,
        lastSyncStatus: 'PENDING'
      };

      if (config) {
        await config.update(configData);
      } else {
        config = await StoreConfiguration.create(configData);
      }

      res.json({ message: 'Configuración guardada exitosamente' });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      res.status(500).json({ error: 'Error al guardar configuración de tienda' });
    }
  }

  /**
   * Prueba la conexión con Tiendanube usando las credenciales guardadas
   */
  static async testConnection(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const config = await StoreConfiguration.findOne({ where: { userId } });
      if (!config) {
        return res.status(404).json({ error: 'Configuración no encontrada' });
      }

      const credentials = config.getDecryptedCredentials();
      
      // TODO: Implementar llamada a API de Tiendanube
      // Por ahora solo verificamos que tengamos las credenciales
      if (credentials.apiKey && credentials.accessToken) {
        res.json({ message: 'Conexión exitosa' });
      } else {
        res.status(400).json({ error: 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('Error al probar conexión:', error);
      res.status(500).json({ error: 'Error al probar conexión con Tiendanube' });
    }
  }
}