import express from 'express';
import cors from "cors";
import "dotenv/config";
import authRoutes from './Routes/authRoutes.js';
import bookRoutes from './Routes/bookRoutes.js';
import job from './lib/cron.js';

import {connectDB} from './lib/db.js';
// Connect to the database

const app = express();
const PORT = process.env.PORT || 3000;


job.start();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/books",bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
})