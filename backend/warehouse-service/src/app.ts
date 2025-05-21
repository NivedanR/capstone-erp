import express from 'express';
import warehouseRoutes from './routes/warehouse.routes';
import { errorHandler } from './middlewares/error.middleware';
import cors from 'cors';
const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',          // your frontend URL
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  }));

app.use('/api/warehouses', warehouseRoutes);

app.use(errorHandler);

export default app;
