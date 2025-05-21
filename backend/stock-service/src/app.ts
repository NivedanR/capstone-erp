import express from 'express';
import cors from 'cors';
import stockRoutes from './routes/stock.routes';
import errorHandler from './middlewares/error.middleware';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use(errorHandler);

export default app;
