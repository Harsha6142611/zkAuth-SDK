import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { register, login, getChallenge } from './controllers/authController.js';
import { config } from './config/config.js';

const app = express();


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

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Connect to MongoDB
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const db = await mongoose.connect(config.mongodb.uri);
  cachedDb = db;
  return db;
}

// Update your routes to use the cached connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.get('/auth/challenge', getChallenge);
app.post('/auth/register', register);
app.post('/auth/login', login);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`ZKAuth backend running on http://localhost:${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
