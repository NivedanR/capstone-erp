import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();
const PORT = process.env.PORT || 5006;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Sales-Service running on port ${PORT}`));
});
