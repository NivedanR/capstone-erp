import dotenv from 'dotenv';
import app from './app';
import  connectDB from './config/db';

dotenv.config();
const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Stock-Service running on port ${PORT}`));
});
