// src/models/User.js
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true, unique: true },
  zkp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
