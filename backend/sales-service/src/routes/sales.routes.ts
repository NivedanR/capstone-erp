import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getSalesAnalytics,
  getSalesData
} from '../controllers/sales.controller';

const router = Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/analytics', getSalesAnalytics);
router.get('/data', getSalesData);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
