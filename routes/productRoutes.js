// routes/productRoutes.js
import express from 'express';
import { 
    getAllProducts, 
    addProduct, 
    getLowStockProducts,
    getLowStockAlertsView, 
    restockProduct      
} from '../controllers/productController.js';

const router = express.Router();

// Route to get all products and add a new product
router.route('/')
    .get(getAllProducts)
    .post(addProduct);

// Route specifically for low stock alerts
router.get('/low-stock', getLowStockProducts);
router.get('/alerts', getLowStockAlertsView);
router.post('/restock', restockProduct);

export default router;