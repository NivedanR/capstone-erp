import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Product Service DB connected successfully');
  } catch (error) {
    console.error('Product Service DB connection failed:', error);
    process.exit(1);
  }
};
