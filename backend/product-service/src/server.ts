// import app from './app';

import dotenv from 'dotenv';
import app from "./app";
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the server
app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error('Failed to start Product Service:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
