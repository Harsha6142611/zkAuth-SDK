import { CryptoUtils } from './utils/crypto.js';

class ZKAuth {
  constructor({ apiKey, authUrl }) {
    this.apiKey = apiKey;
    this.authUrl = authUrl || 'http://localhost:3000/auth';
    this.isUnlocked = false;
    this.setupInactivityTimer();
  }

  setupInactivityTimer() {
    document.addEventListener('mousemove', this.resetTimer.bind(this));
    document.addEventListener('keypress', this.resetTimer.bind(this));
  }

  resetTimer() {
    if (this.isUnlocked) {
      try {
        CryptoUtils.getStoredPrivateKey(); // This updates last activity
      } catch (error) {
        if (error.message === 'Session expired') {
          this.isUnlocked = false;
          // Trigger UI update or notification
        }
      }
    }
  }

  async unlock(password) {
    try {
      await CryptoUtils.unlockVault(password);
      this.isUnlocked = true;
    } catch (error) {
      throw new Error(`Failed to unlock vault: ${error.message}`);
    }
  }

  lock() {
    CryptoUtils.vaultManager.lockVault();
    this.isUnlocked = false;
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
      // Generate key pair first
      const keyPair = await CryptoUtils.generateKeyPair(secretKey);
      
      // Create proof for registration
      const proof = await CryptoUtils.createProofForRegistration(keyPair.privateKey, challenge);
      
      // Send registration request
      const response = await fetch(`${this.authUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          publicKey: keyPair.publicKey,
          proof,
          challenge
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      // After successful registration, unlock the vault
      await CryptoUtils.unlockVault(secretKey);
      this.isUnlocked = true;

      const result = await response.json();
      return {
        ...result,
        publicKey: keyPair.publicKey
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login with the server
  async login(apiKey, secretKey, challenge) {
    try {
      if (!this.isUnlocked) {
        throw new Error('Please unlock with your secret key first');
      }
      
      const privateKey = await CryptoUtils.getStoredPrivateKey();
      if (!privateKey) {
        throw new Error('Please register first');
      }

      // Create proof using stored private key
      const proofData = await CryptoUtils.createProof(privateKey, challenge);
      
      // Verify locally before sending
      const isValidLocally = CryptoUtils.verifyProofLocally(
        proofData.publicKey, 
        { r: proofData.r, s: proofData.s }, 
        challenge
      );
      
      if (!isValidLocally) {
        throw new Error('Local proof verification failed');
      }

      const response = await fetch(`${this.authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          publicKey: proofData.publicKey,
          proof: { r: proofData.r, s: proofData.s },
          challenge
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Add logout method
  logout() {
    CryptoUtils.clearStoredKeys();
    localStorage.removeItem('zkauth_logged_in');
  }
}

export default ZKAuth;
