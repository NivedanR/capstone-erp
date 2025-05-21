import express, { Express } from 'express';
import bodyParser from 'body-parser';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middlewares/error.middleware';
import cors from 'cors';

const app: Express = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

// Routes
app.use('/api/products', productRoutes);

// 404 handler
app.use((req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
    service: 'product-service'
  });
});

// Error handling middleware should be last
app.use(errorHandler);

export default app;
