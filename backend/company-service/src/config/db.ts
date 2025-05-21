import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string); // Type assertion to ensure process.env.MONGO_URI is a string
    console.log('Company DB connected');
  } catch (error) {
    console.error('Company DB connection failed', error);
    process.exit(1);
  }
};