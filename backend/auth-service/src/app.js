const express = require('express');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
  }));
  

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

module.exports = app;