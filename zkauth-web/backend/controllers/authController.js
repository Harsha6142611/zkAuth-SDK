import User from '../models/User.js';
import { CryptoUtils } from '../utils/crypto.js';

export async function generateApiKey(req, res) {
  try {
    console.log('Received generate API key request:', req.body);
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        message: 'Public key is required',
        code: 'MISSING_PUBLIC_KEY'
      });
    }

    // Find or create user
    let user = await User.findOne({ publicKey });
    
    if (!user) {
      // Create new user with public key and generate API key
      const apiKey = User.generateApiKey();
      user = new User({
        publicKey,
        apiKey
      });
      await user.save();
      console.log('New user created with API key');
    } else if (!user.apiKey) {
      // Generate API key for existing user without one
      user.apiKey = User.generateApiKey();
      await user.save();
      console.log('Generated new API key for existing user');
    }

    res.json({
      message: 'API key retrieved successfully',
      code: 'API_KEY_SUCCESS',
      apiKey: user.apiKey,
      publicKey: user.publicKey
    });

  } catch (error) {
    console.error('API key operation error:', error);
    res.status(500).json({
      message: 'Failed to process API key',
      code: 'API_KEY_ERROR'
    });
  }
}