import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const productController = new ProductController();

// Rutas protegidas para análisis de inventario
router.use(authMiddleware);

// Obtener productos con filtros avanzados
router.get('/', productController.getProducts);

// Obtener análisis de inventario
router.get('/analysis', productController.getInventoryAnalysis);

// Actualizar costo de producto
router.put('/:productId/cost', productController.updateProductCost);

export default router;