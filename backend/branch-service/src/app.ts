import express from 'express';
import dotenv from 'dotenv';
import branchRoutes from './routes/branch.routes';

dotenv.config();
const app = express();
import cors from 'cors';

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use('/api', branchRoutes);

export default app;
