import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { register, login, getChallenge } from './controllers/authController.js';
import { config } from './config/config.js';
import { authLimiter } from './middleware/rateLimiter.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import { verifyApiKey } from './middleware/apiKeyVerifier.js';
import crypto from 'crypto';
// import { User } from './models/user.js';
// import { ApiKey } from './models/apiKey.js';
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? config.server.cors.origins
    : ['http://localhost:5173', 'http://localhost:3000','http://localhost:3000/auth'],
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
app.post('/auth/verify-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        isValid: false,
        message: 'API key is required'
      });
    }

    // First, check in zkauth_web's MongoDB (MONGODB_NEW_DB)
    const webDbConnection = mongoose.createConnection(config.mongodb.apiKeyUri);
    const WebUserSchema = new mongoose.Schema({
      apiKey: { 
        type: String, 
        required: true, 
        unique: true 
      },
      publicKey: { 
        type: String, 
        required: true, 
        unique: true 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      lastLogin: { 
        type: Date, 
        default: Date.now 
      }
    });



    const WebUser = webDbConnection.model('User', WebUserSchema);

    try {
      // Check if API key exists in zkauth_web's database
      const developerUser = await WebUser.findOne({ apiKey });
      await webDbConnection.close();

      if (!developerUser) {
        return res.status(401).json({
          isValid: false,
          message: 'Invalid API key. Please obtain a valid key from zkAuth dashboard.'
        });
      }

      // // If API key is valid, update last login
      // developerUser.lastLogin = new Date();
      // await developerUser.save();

      // API key is valid, proceed with the request
      res.json({ 
        isValid: true,
        message: 'API key is valid',
        publicKey: developerUser.publicKey
      });

    } catch (error) {
      await webDbConnection.close();
      throw error;
    }

  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({
      isValid: false,
      message: 'Error verifying API key'
    });
  }
});

// Add before the error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Update error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
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
