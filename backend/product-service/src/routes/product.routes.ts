import express, { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router: Router = express.Router();
const controller = new ProductController();

// Create a new product
router.post('/', controller.createProduct);

// Get all products
router.get('/', controller.getProducts);

// Get product by ID
router.get('/:id', controller.getProductById);

// Get products by company ID
router.get('/company/:companyId', controller.getProductsByCompanyId);

// Add the decrement quantity route
router.put('/:productId/decrement', controller.decrementProductQuantity);

export default router;
