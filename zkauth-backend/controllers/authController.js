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
      nonce: 0,
      lastLogin: new Date()
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
    console.log('Login attempt:', {
      publicKey: publicKey.substring(0, 10) + '...',
      challenge: challenge.substring(0, 10) + '...'
    });

    const user = await User.findOne({ publicKey });
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const isValid = await CryptoUtils.verifyProof(publicKey, proof, challenge);
    console.log('Proof verification result:', isValid);

    if (!isValid) {
      return res.status(401).json({ 
        message: 'Invalid proof',
        code: 'INVALID_PROOF'
      });
    }

    // Update user data
    user.nonce += 1;
    user.lastLogin = new Date();
    user.apiKey = apiKey; // Update apiKey if changed
    await user.save();

    // Generate session token
    const token = CryptoUtils.generateSessionToken();

    res.json({
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      token,
      publicKey,
      nonce: user.nonce,
      expiresIn: 3600 // 1 hour token expiration
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ 
      message: error.message,
      code: 'LOGIN_ERROR'
    });
  }
}
