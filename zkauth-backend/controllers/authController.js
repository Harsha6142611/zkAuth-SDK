import crypto from 'crypto-js';

// Mock in-memory storage (not recommended for production)
const users = {};

// Function to simulate ZKP (Zero-Knowledge Proof)
function generateZKP(publicKey) {
  return crypto.SHA256(publicKey).toString();  // This is a mock ZKP
}

// Registration function
export function register(req, res) {
  const { apiKey, publicKey } = req.body;

  if (!apiKey || !publicKey) {
    return res.status(400).json({ message: 'API Key and Public Key are required' });
  }

  // Check if the user is already registered
  if (users[publicKey]) {
    return res.status(400).json({ message: 'User already registered' });
  }

  // Store user data in the mock database
  users[publicKey] = { apiKey, zkp: generateZKP(publicKey) };

  return res.status(200).json({ message: 'Registration successful', zkp: users[publicKey].zkp });
}

// Login function
export function login(req, res) {
  const { apiKey, publicKey } = req.body;

  if (!apiKey || !publicKey) {
    return res.status(400).json({ message: 'API Key and Public Key are required' });
  }

  // Verify if user is registered
  const user = users[publicKey];
  if (!user || user.apiKey !== apiKey) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check ZKP (mock verification)
  const zkp = generateZKP(publicKey);
  if (zkp !== user.zkp) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  return res.status(200).json({ message: 'Login successful', sessionToken: 'mock_session_token' });
}
