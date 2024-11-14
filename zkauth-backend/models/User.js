// src/models/User.js
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  apiKey: { type: String, required: true },
  publicKey: { type: String, required: true, unique: true },
  zkp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Drop any existing indexes before creating new ones
const User = mongoose.model('User', userSchema);
User.collection.dropIndexes().then(() => {
  // Create only the indexes we want
  User.collection.createIndex({ publicKey: 1 }, { unique: true });
  User.collection.createIndex({ apiKey: 1, publicKey: 1 }); // Compound index without unique constraint
}).catch(err => {
  console.error('Error managing indexes:', err);
});

export default User;
