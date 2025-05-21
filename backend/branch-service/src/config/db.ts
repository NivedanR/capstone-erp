import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string); // Type assertion to ensure process.env.MONGO_URI is a string
    console.log('Branch DB connected');
  } catch (error) {
    console.error('Branch DB connection failed', error);
    process.exit(1);
  }
};
