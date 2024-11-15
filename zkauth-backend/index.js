import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { register, login, getChallenge } from './controllers/authController.js';
import { config } from './config/config.js';
import { authLimiter } from './middleware/rateLimiter.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? config.server.cors.origins
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
await connectDB();

// Routes
app.get('/auth/challenge', getChallenge);
app.post('/auth/register', authLimiter, register);
app.post('/auth/login', authLimiter, login);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`ZKAuth backend running on http://localhost:${PORT}`);
});
