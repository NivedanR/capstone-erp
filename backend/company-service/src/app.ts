// src/app.ts  (or server.ts / index.ts)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import companyRoutes from './routes/company.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();
const app = express();

// ⬇️ Enable CORS for your React origin
app.use(
  cors({
    origin: 'http://localhost:3000',            // your React app’s URL
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
  })
);

// ⬇️ JSON parsing
app.use(express.json());

// Mount your company routes
app.use('/api/company', companyRoutes);

// Error handler
app.use(errorHandler);

export default app;