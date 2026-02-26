import express from 'express';
import { 
    getAllCustomers, 
    addCustomer, 
    getCustomerPurchaseHistory 
} from '../controllers/customerController.js';

const router = express.Router();

router.route('/')
    .get(getAllCustomers)
    .post(addCustomer);

router.get('/:customer_id/history', getCustomerPurchaseHistory);

export default router;