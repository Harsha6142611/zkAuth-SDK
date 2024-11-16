import * as bip39 from 'bip39';
import pkg from 'elliptic';
const { ec: EC } = pkg;
const ec = new EC('secp256k1');

export class VaultManager {
  constructor() {
    this.dbName = 'zkauth';
    this.storeName = 'vault';
    this.db = null;
    this.unlockedPrivateKey = null;
    this.lastActivity = null;
    this.timeoutDuration = 15 * 60 * 1000;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(new Error('Failed to open database'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async createVault(privateKey, password, recoveryPhrase) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encryptionKey = await this.deriveKey(password, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      new TextEncoder().encode(privateKey)
    );

    const vault = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      encryptedData: Array.from(new Uint8Array(encryptedData)),
      recoveryPhrase: recoveryPhrase
    };

    await this.initDB();
    const tx = this.db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.put(vault, 'currentVault');
  }

  async unlockVault(password) {
    try {
      await this.initDB();
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const vault = await new Promise((resolve, reject) => {
        const request = store.get('currentVault');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!vault) {
        throw new Error('No vault found - please register first');
      }

      const encryptionKey = await this.deriveKey(password, new Uint8Array(vault.salt));
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(vault.iv) },
        encryptionKey,
        new Uint8Array(vault.encryptedData)
      );

      this.unlockedPrivateKey = new TextDecoder().decode(decrypted);
      this.lastActivity = Date.now();
      return this.unlockedPrivateKey;
    } catch (error) {
      console.error('Vault unlock error:', error);
      throw new Error('Access denied - please try again');
    }
  }

  async deriveKey(password, salt) {
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      256
    );

    return window.crypto.subtle.importKey(
      'raw',
      derivedBits,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  getPrivateKey() {
    if (!this.unlockedPrivateKey) {
      throw new Error('Vault is locked');
    }
    
    if (Date.now() - this.lastActivity > this.timeoutDuration) {
      this.lockVault();
      throw new Error('Session expired');
    }
    
    this.lastActivity = Date.now();
    return this.unlockedPrivateKey;
  }

  lockVault() {
    this.unlockedPrivateKey = null;
    this.lastActivity = null;
  }

  checkSession() {
    if (!this.lastActivity || Date.now() - this.lastActivity > this.timeoutDuration) {
      this.lockVault();
      return false;
    }
    return true;
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  async restoreFromRecoveryPhrase(recoveryPhrase, newPassword) {
    if (!bip39.validateMnemonic(recoveryPhrase)) {
      throw new Error('Invalid recovery phrase');
    }
    
    const seed = await bip39.mnemonicToSeed(recoveryPhrase);
    const privateKey = seed.slice(0, 32).toString('hex');
    await this.createVault(privateKey, newPassword, recoveryPhrase);
    return privateKey;
  }

  async exportRecoveryPhrase(password) {
    try {
      await this.unlockVault(password);
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const vault = await new Promise((resolve, reject) => {
        const request = store.get('currentVault');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return vault.recoveryPhrase;
    } catch (error) {
      throw new Error('Failed to export recovery phrase');
    }
  }
} 