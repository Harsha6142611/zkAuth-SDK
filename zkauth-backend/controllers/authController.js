import User from '../models/User.js';
import { CryptoUtils } from '../utils/crypto.js';

// Generate challenge for ZKP
export async function getChallenge(req, res) {
  console.log("Generating challenge...");
  const challenge = CryptoUtils.generateChallenge();
  res.json({ challenge });
}

// Registration function
export async function register(req, res) {
  try {
    const { apiKey, publicKey, proof, challenge } = req.body;

    // Only check for existing publicKey
    const existingUser = await User.findOne({ publicKey });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'Public key already registered',
        code: 'DUPLICATE_PUBLIC_KEY'
      });
    }

    // Verify the proof
    const isValid = await CryptoUtils.verifyProof(publicKey, proof, challenge);
    if (!isValid) {
      return res.status(400).json({ 
        message: 'Invalid proof',
        code: 'INVALID_PROOF'
      });
    }

    // Create new user
    const user = new User({
      apiKey,
      publicKey,
      zkp: JSON.stringify(proof)
    });

    await user.save();
    res.json({ 
      message: 'User registered successfully',
      code: 'REGISTRATION_SUCCESS'
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern.publicKey) {
        return res.status(409).json({
          message: 'Public key already registered',
          code: 'DUPLICATE_PUBLIC_KEY'
        });
      }
    }
    res.status(400).json({ 
      message: error.message,
      code: 'REGISTRATION_ERROR'
    });
  }
}

// Login function
export async function login(req, res) {
  try {
    const { apiKey, publicKey, proof, challenge } = req.body;

    // Find user by both apiKey and publicKey
    const user = await User.findOne({ apiKey, publicKey });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify the proof
    const isValid = await CryptoUtils.verifyProof(publicKey, proof, challenge);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid proof' });
    }

    // Generate session token
    const token = CryptoUtils.generateSessionToken();

    res.json({
      message: 'Login successful',
      token,
      publicKey // Return publicKey for client reference
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message });
  }
}
