import mongoose from 'mongoose';
import { config } from '../config/config.js';

const apiKeySchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApiKeyConnection = mongoose.createConnection(config.mongodb.apiKeyUri);
const ApiKey = ApiKeyConnection.model('ApiKey', apiKeySchema);

export default ApiKey;

