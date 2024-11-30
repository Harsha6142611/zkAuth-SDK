import mongoose from "mongoose";
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
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

// Generate API Key
userSchema.statics.generateApiKey = function() {
  return crypto.randomBytes(8).toString('hex'); // 16 characters
};

const User = mongoose.model('User', userSchema);
export default User;