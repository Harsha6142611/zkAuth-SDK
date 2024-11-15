import pkg from 'elliptic';
const { ec: EC } = pkg;
const ec = new EC('secp256k1');
import * as bip39 from 'bip39';
import { VaultManager } from './VaultManager';

let BufferClass;
try {
  BufferClass = Buffer;
} catch {
  BufferClass = require('buffer').Buffer;
}

export class CryptoUtils {
  constructor() {
    this.vaultManager = new VaultManager();
  }

  // Browser-compatible challenge generation
  static generateChallenge() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Browser-compatible session token generation
  static generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async generateKeyPair(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const privateKeyBytes = new Uint8Array(hashBuffer);
      const privateKey = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKey = '04' + keyPair.getPublic('hex');
      
      // Create vault with the generated private key
      await this.vaultManager.createVault(privateKey, password);
      
      return { privateKey, publicKey };
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error.message}`);
    }
  }

  static generateRecoveryPhrase() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const entropy = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return bip39.entropyToMnemonic(entropy);
  }

  static async recoverFromPhrase(recoveryPhrase) {
    const seed = await bip39.mnemonicToSeed(recoveryPhrase);
    const keyPair = ec.keyFromPrivate(seed.slice(0, 32));
    return {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: '04' + keyPair.getPublic('hex')
    };
  }

  static async createProof(secretKey, challenge) {
    try {
      if (!this.vaultManager) {
        this.vaultManager = new VaultManager();
      }

      const privateKey = await this.vaultManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('No stored keys found. Please register first.');
      }

      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const challengeBuffer = BufferClass.from(challenge, 'hex');
      const signature = keyPair.sign(challengeBuffer);
      
      return {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex'),
        publicKey: '04' + keyPair.getPublic('hex')
      };
    } catch (error) {
      console.error('Create proof error details:', error);
      throw new Error(`Failed to create proof: ${error.message}`);
    }
  }

  static verifyProofLocally(publicKey, proof, challenge) {
    try {
      const cleanPublicKey = publicKey.startsWith('04') ? publicKey.slice(2) : publicKey;
      const key = ec.keyFromPublic(cleanPublicKey, 'hex');
      
      const challengeBuffer = BufferClass.from(challenge, 'hex');
      
      return key.verify(challengeBuffer, {
        r: proof.r,
        s: proof.s
      });
    } catch (error) {
      console.error('Local proof verification error:', error);
      return false;
    }
  }

  // Add new methods for key management
  static async getStoredPrivateKey() {
    if (!this.vaultManager) {
      this.vaultManager = new VaultManager();
    }
    return this.vaultManager.getPrivateKey();
  }

  static async getOrCreateKeyPair(secretKey) {
    try {
      const storedPrivateKey = await this.getStoredPrivateKey();
      
      if (storedPrivateKey) {
        const keyPair = ec.keyFromPrivate(storedPrivateKey, 'hex');
        const publicKey = '04' + keyPair.getPublic('hex');
        return { privateKey: storedPrivateKey, publicKey };
      }
      
      return this.generateKeyPair(secretKey);
    } catch (error) {
      return this.generateKeyPair(secretKey);
    }
  }

  static clearStoredKeys() {
    if (!this.vaultManager) {
      this.vaultManager = new VaultManager();
    }
    this.vaultManager.lockVault();
  }

  static async createProofForRegistration(privateKey, challenge) {
    try {
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      
      const challengeBuffer = BufferClass.from(challenge, 'hex');
      const signature = keyPair.sign(challengeBuffer);
      
      return {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex')
      };
    } catch (error) {
      throw new Error(`Failed to create registration proof: ${error.message}`);
    }
  }

  // Add new methods for vault management
  static async unlockVault(password) {
    await this.vaultManager.unlockVault(password);
  }

  static lockVault() {
    this.vaultManager.lockVault();
  }

  static vaultManager = new VaultManager();

  static {
    if (typeof window !== 'undefined') {
      this.vaultManager = new VaultManager();
    }
  }
}
