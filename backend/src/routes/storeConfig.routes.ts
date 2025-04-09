import { Router } from 'express';
import { StoreConfigController } from '../controllers/StoreConfigController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rutas de configuración de tienda protegidas por authenticateToken
router.get('/config', authenticateToken, StoreConfigController.getConfig);
router.post('/config', authenticateToken, StoreConfigController.saveConfig);
router.post('/config/test', authenticateToken, StoreConfigController.testConnection);

export default router;