// src/models/User.js
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
  publicKey: { type: String, required: true, unique: true },
  nonce: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
