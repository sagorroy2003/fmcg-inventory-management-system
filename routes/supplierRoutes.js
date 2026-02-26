import express from 'express';
import { 
    getAllSuppliers, 
    addSupplier, 
    getSupplierPerformance 
} from '../controllers/supplierController.js';

const router = express.Router();

router.route('/')
    .get(getAllSuppliers)
    .post(addSupplier);

router.get('/performance', getSupplierPerformance);

export default router;