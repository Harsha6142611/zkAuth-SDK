import pkg from 'elliptic';
const { ec: EC } = pkg;
const ec = new EC('secp256k1');
import { CryptoUtils } from './utils/crypto.js';

class ZKAuth {
  static instance = null;
  static isApiKeyVerified = false;

  constructor({ apiKey, authUrl, sessionConfig }) {
    // Singleton pattern: return existing instance if already created
    if (ZKAuth.instance) {
      return ZKAuth.instance;
    }

    this.apiKey = apiKey;
    this.authUrl = authUrl || 'https://zkauth-backend.vercel.app/auth';
    this.isUnlocked = false;
    this.authStateListeners = new Set();
    this.overlayId = 'zkauth-overlay';
    
    // Only verify API key if not already verified
    if (!ZKAuth.isApiKeyVerified) {
      // Create and append overlay immediately
      this.createOverlay();
      
      // Verify API key before proceeding
      this.verifyApiKey().then(({ isValid, message }) => {
        if (!isValid) {
          console.error('❌ API Key Error:', message);
          this.showInvalidApiKeyPopup(message);
        } else {
          console.log('✅ API Key Verified:', message);
          ZKAuth.isApiKeyVerified = true;
          this.removeOverlay();
          
          // Continue with session configuration only if API key is valid
          if (sessionConfig) {
            CryptoUtils.vaultManager.setSessionConfig({
              timeoutDuration: sessionConfig.timeoutDuration || 10 * 60 * 1000,
              onSessionExpired: () => {
                this.handleSessionExpired();
              }
            });
          }
        }
      }).catch(error => {
        console.error('❌ API Key Verification Failed:', error.message);
        this.showInvalidApiKeyPopup('API key verification failed. Please ensure you have a valid API key from zkAuth dashboard.');
      });
    }

    ZKAuth.instance = this;
    return this;
  }

  createOverlay() {
    // Remove existing overlay if any
    this.removeOverlay();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    document.body.appendChild(overlay);
  }

  removeOverlay() {
    const existingOverlay = document.getElementById(this.overlayId);
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }

  showInvalidApiKeyPopup(message) {
    const overlay = document.getElementById(this.overlayId);
    if (!overlay) return;

    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;

    popup.innerHTML = `
      <h2 style="color: #e53e3e; margin-bottom: 15px;">Invalid API Key</h2>
      <p style="color: #4a5568; margin-bottom: 20px;">${message}</p>
      <p style="color: #718096; font-size: 14px;">Please visit 
        <a href="https://zkauth-web.vercel.app" target="_blank" 
           style="color: #4299e1; text-decoration: none;">
          zkAuth Dashboard
        </a> 
        to obtain a valid API key
      </p>
    `;

    overlay.appendChild(popup);
  }

  async verifyApiKey() {
    try {
      const response = await fetch(`${this.authUrl}/verify-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isValid: false,
          message: data.message || 'Invalid API key'
        };
      }

      return {
        isValid: data.isValid,
        message: data.message
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Failed to verify API key. Please check your internet connection.'
      };
    }
  }

  setupInactivityTimer() {
    const resetTimer = () => {
      if (this.isUnlocked) {
        CryptoUtils.vaultManager.updateActivity();
      }
    };

   
    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer);
    });
  }

  handleSessionExpired() {
    this.isUnlocked = false;
    localStorage.removeItem('zkauth_logged_in');
    this.notifyAuthStateChange();
    
    
    const event = new CustomEvent('zkauth_session_expired');
    window.dispatchEvent(event);
  }


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


  async generateKeyPair(secretKey) {
    try {
      return await CryptoUtils.generateKeyPair(secretKey);
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error.message}`);
    }
  }

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
   
      const recoveryKit = await CryptoUtils.generateRecoveryKit();
      
  
      const keyPair = ec.keyFromPrivate(recoveryKit.privateKey);
      const publicKey = '04' + keyPair.getPublic('hex');
    
      const proof = await CryptoUtils.createProofForRegistration(
        recoveryKit.privateKey, 
        challenge
      );
      
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
   
      const privateKey = await this.unlock(secretKey);
      
      if (!privateKey) {
        throw new Error('Failed to unlock vault');
      }
    
      const proof = await CryptoUtils.createProofForRegistration(privateKey, challenge);
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
   at
      if (!CryptoUtils.validateRecoveryPhrase(recoveryPhrase)) {
        throw new Error('Invalid recovery phrase format');
      }

      const result = await this.recoverAccount(recoveryPhrase, newPassword);
      const challenge = await this.getChallenge();
     
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
