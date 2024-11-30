import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/zkauth',
    apiKeyUri: process.env.MONGODB_NEW_URL,
    options: {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    }
  },
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origins: process.env.CORS_ORIGINS ? 
        process.env.CORS_ORIGINS.split(',') : 
        ['http://localhost:5173'],
      methods: ['GET', 'POST']
    }
  }
}; 