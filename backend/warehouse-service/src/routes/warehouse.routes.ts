import { Router } from 'express';
import {
  approveStockRequest,
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  getWarehouseStock,
  getWarehouseWithBranches,
  rejectStockRequest,
  requestReplenish,
  getWarehouseProducts,
  assignProductToWarehouse,
  removeProductFromWarehouse,
} from '../controllers/warehouse.controller';

const router = Router();

router.post('/', createWarehouse);
router.get('/', getAllWarehouses);
router.get('/:warehouseId/with-branches', getWarehouseWithBranches);
router.get('/:warehouseId', getWarehouseById);
router.get('/:warehouseId/stock', getWarehouseStock);
router.post('/stock-requests/:requestId/approve', approveStockRequest);
router.post('/stock-requests/:requestId/reject', rejectStockRequest);
router.post('/:warehouseId/replenish-requests', requestReplenish);

// Product management routes
router.get('/:warehouseId/products', getWarehouseProducts);
router.post('/:warehouseId/products', assignProductToWarehouse);
router.delete('/:warehouseId/products', removeProductFromWarehouse);

export default router;
