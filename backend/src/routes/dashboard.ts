import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Proteger todas las rutas del dashboard con autenticación
router.use(authMiddleware);

// Ruta para obtener métricas del dashboard
router.get('/metrics', DashboardController.getMetrics);

export default router;