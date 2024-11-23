import pkg from 'elliptic';
const { ec: EC } = pkg;
const ec = new EC('secp256k1');
import { CryptoUtils } from './utils/crypto.js';

class ZKAuth {
  constructor({ apiKey, authUrl, sessionConfig }) {
    this.apiKey = apiKey;
    this.authUrl = authUrl || 'http://localhost:3000/auth';
    this.isUnlocked = false;
    this.authStateListeners = new Set();
    
    // Configure session timeout
    if (sessionConfig) {
      CryptoUtils.vaultManager.setSessionConfig({
        timeoutDuration: sessionConfig.timeoutDuration || 10 * 60 * 1000,
        onSessionExpired: () => {
          this.handleSessionExpired();
        }
      });
    }
    
    this.setupInactivityTimer();
  }

  setupInactivityTimer() {
    const resetTimer = () => {
      if (this.isUnlocked) {
        CryptoUtils.vaultManager.updateActivity();
      }
    };

    // Add more event listeners for better activity tracking
    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer);
    });
  }

  handleSessionExpired() {
    this.isUnlocked = false;
    localStorage.removeItem('zkauth_logged_in');
    
    // Notify listeners about session expiration
    this.notifyAuthStateChange();
    
    // Dispatch session expired event
    const event = new CustomEvent('zkauth_session_expired');
    window.dispatchEvent(event);
  }

  // Add this method to allow runtime configuration updates
  updateSessionConfig(config) {
    CryptoUtils.vaultManager.setSessionConfig(config);
  }

  async unlock(password) {
    try {
      const privateKey = await CryptoUtils.vaultManager.unlockVault(password);
      this.isUnlocked = true;
      return privateKey;
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
      // Generate recovery phrase and private key
      const recoveryKit = await CryptoUtils.generateRecoveryKit();
      
      // Generate key pair from private key
      const keyPair = ec.keyFromPrivate(recoveryKit.privateKey);
      const publicKey = '04' + keyPair.getPublic('hex');
      
      // Create proof for registration
      const proof = await CryptoUtils.createProofForRegistration(
        recoveryKit.privateKey, 
        challenge
      );
      
      // Register with server
      const response = await fetch(`${this.authUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          publicKey,
          proof,
          challenge
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Create vault with recovery phrase
      await CryptoUtils.vaultManager.createVault(
        recoveryKit.privateKey,
        secretKey,
        recoveryKit.recoveryPhrase
      );

      return {
        success: true,
        recoveryPhrase: recoveryKit.recoveryPhrase,
        publicKey,
        message: 'IMPORTANT: Save your recovery phrase in a secure location. ' +
                 'You will need it to recover your account on other devices.'
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login with the server
  async login(apiKey, secretKey, challenge) {
    try {
      // First unlock the vault with the secret key
      const privateKey = await this.unlock(secretKey);
      
      if (!privateKey) {
        throw new Error('Failed to unlock vault');
      }
      // Create proof using private key
      const proof = await CryptoUtils.createProofForRegistration(privateKey, challenge);
      
      // Generate public key
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKey = '04' + keyPair.getPublic('hex');

      const response = await fetch(`${this.authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const result = await response.json();
      localStorage.setItem('zkauth_logged_in', 'true');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Add logout method
  logout() {
    CryptoUtils.clearStoredKeys();
    localStorage.removeItem('zkauth_logged_in');
  }

  async recoverAccount(recoveryPhrase, newPassword) {
    try {
      const privateKey = await CryptoUtils.vaultManager.restoreFromRecoveryPhrase(
        recoveryPhrase,
        newPassword
      );

      const keyPair = ec.keyFromPrivate(privateKey);
      const publicKey = '04' + keyPair.getPublic('hex');

      await this.unlock(newPassword);
      return { success: true, publicKey };
    } catch (error) {
      console.error('Recovery error:', error);
      throw new Error(`Recovery failed: ${error.message}`);
    }
  }

  async exportRecoveryPhrase(password) {
    try {
      return await CryptoUtils.vaultManager.exportRecoveryPhrase(password);
    } catch (error) {
      throw new Error(`Failed to export recovery phrase: ${error.message}`);
    }
  }

  async importFromRecoveryPhrase(recoveryPhrase, newPassword) {
    try {
      // Validate recovery phrase format
      if (!CryptoUtils.validateRecoveryPhrase(recoveryPhrase)) {
        throw new Error('Invalid recovery phrase format');
      }

      // Restore account using recovery phrase
      const result = await this.recoverAccount(recoveryPhrase, newPassword);
      
      // Get a challenge for login verification
      const challenge = await this.getChallenge();
      
      // Attempt login to verify recovery worked
      await this.login(this.apiKey, newPassword, challenge);
      
      return {
        success: true,
        publicKey: result.publicKey,
        message: 'Account successfully imported'
      };
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  cleanup() {
    document.removeEventListener('mousemove', this.resetTimer.bind(this));
    document.removeEventListener('keypress', this.resetTimer.bind(this));
    this.lock();
  }
}

export default ZKAuth;
