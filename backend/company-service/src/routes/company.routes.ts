import { Router } from 'express';
import {
  approveReplenishRequest,
  createCompany,
  createReplenishRequest,
  getCompanies,
  getCompaniesByNames,
  getCompanyById,
  getCompanyWithProducts,
  rejectReplenishRequest,
} from '../controllers/company.controller';

const router = Router();

router.post('/', createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/products', getCompanyWithProducts); 
router.get('/by-names', getCompaniesByNames); 
console.log('🔌 company.routes.ts is loaded');
router.post('/api/companies/:companyId/replenish-requests', createReplenishRequest);

// Approve or reject it
router.post('/replenish-requests/:requestId/approve',  approveReplenishRequest);
router.post('/replenish-requests/:requestId/reject',   rejectReplenishRequest);
export default router;