import { CryptoUtils } from './utils/crypto.js';

class ZKAuth {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.authUrl = config.authUrl;
  }

  // Get challenge from the server
  async getChallenge() {
    try {
      const response = await fetch(`${this.authUrl}/challenge`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.challenge;
    } catch (error) {
      console.error('Error in getChallenge:', error);
      throw new Error(`Failed to get challenge: ${error.message}`);
    }
  }

  // Generate key pair using the secret key
  async generateKeyPair(secretKey) {
    try {
      return await CryptoUtils.generateKeyPair(secretKey);
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error.message}`);
    }
  }

  // Create proof using secret key and challenge
  async createProof(secretKey, challenge) {
    try {
      return await CryptoUtils.createProof(secretKey, challenge);
    } catch (error) {
      throw new Error(`Failed to create proof: ${error.message}`);
    }
  }

  // Register with the server
  async register(apiKey, secretKey, challenge) {
    try {
      const keyPair = await CryptoUtils.generateKeyPair(secretKey);
      const proof = await CryptoUtils.createProof(secretKey, challenge);

      const isValidLocally = CryptoUtils.verifyProofLocally(keyPair.publicKey, proof, challenge);
      if (!isValidLocally) {
        throw new Error('Local proof verification failed');
      }

      const response = await fetch(`${this.authUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey,
          publicKey: keyPair.publicKey,
          proof,
          challenge
        })
      });

      const data = await response.json();

      if (!response.ok) {
        switch (data.code) {
          case 'DUPLICATE_PUBLIC_KEY':
            throw new Error('This secret key is already registered');
          case 'INVALID_PROOF':
            throw new Error('Server rejected the proof');
          default:
            throw new Error(data.message || 'Registration failed');
        }
      }

      return {
        success: true,
        message: data.message,
        publicKey: keyPair.publicKey
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login with the server
  async login(apiKey, publicKey, proof, challenge) {
    try {
      const isValidLocally = CryptoUtils.verifyProofLocally(publicKey, proof, challenge);
      if (!isValidLocally) {
        throw new Error('Local proof verification failed');
      }

      const response = await fetch(`${this.authUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey,
          publicKey,
          proof,
          challenge
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}

export default ZKAuth;
