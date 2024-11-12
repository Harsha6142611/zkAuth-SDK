// src/models/User.js
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  publicKey: { type: String, required: true, unique: true },
  recoveryPhrase: { type: String, required: true }, // Stored temporarily for demonstration
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
