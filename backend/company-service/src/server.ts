// src/server.js
import app from './app';            // <-- matches src/app.js
import { connectDB } from './config/db';

const PORT = Number(process.env.PORT) || 5001;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Company service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });