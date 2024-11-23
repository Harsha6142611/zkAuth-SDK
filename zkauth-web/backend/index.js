import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { generateApiKey } from './controllers/authController.js';
import cors from 'cors';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/auth/generate-api-key', generateApiKey);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});