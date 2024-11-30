import ApiKey from '../models/ApiKey.js';

export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.body.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        message: 'API key is required',
        code: 'API_KEY_MISSING'
      });
    }

    const validApiKey = await ApiKey.findOne({ 
      key: apiKey,
      isActive: true 
    });

    if (!validApiKey) {
      return res.status(401).json({
        message: 'Invalid or inactive API key',
        code: 'INVALID_API_KEY'
      });
    }

    next();
  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({
      message: 'Error verifying API key',
      code: 'API_KEY_VERIFICATION_ERROR'
    });
  }
};