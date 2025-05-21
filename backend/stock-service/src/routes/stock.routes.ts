import { Router } from 'express';
import {
  createStock,
  getAllStocks,
  getStockById,
  updateStock,
  deleteStock,
  getStockByWarehouseId,
  getStockByBranchId,
  getStockByBranchAndProduct,
  createStockRequest,
  approveStockRequest,
  rejectStockRequest,
  updateStockForWarehouseProduct,
  getStockByWarehouseAndProduct,
  updateStockForBranchProduct,
} from '../controllers/stock.controller';

const router = Router();

// CRUD
router.post('/', createStock);
router.get('/', getAllStocks);
router.get('/:id', getStockById);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

// Stock-by-warehouse (path param)
router.get('/warehouse/:warehouseId', getStockByWarehouseId);
router.get('/warehouse/:warehouseId/product/:productId', getStockByWarehouseAndProduct);

// Stock-by-branch (path param, NOT query param)
router.get('/branch/:branchId', getStockByBranchId);
router.get('/branch/:branchId/product/:productId', getStockByBranchAndProduct);
router.put('/branch/:branchId/product/:productId', updateStockForBranchProduct);

// Stock requests
router.post('/stock-requests', createStockRequest);
router.post('/stock-requests/:requestId/approve', approveStockRequest);
router.post('/stock-requests/:requestId/reject', rejectStockRequest);
router.put('/warehouse/:warehouseId/product/:productId',updateStockForWarehouseProduct);

export default router;
