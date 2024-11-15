export class VaultManager {
  constructor() {
    this.vault = null;
    this.unlockedPrivateKey = null;
    this.lastActivity = null;
    this.timeoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  async createVault(privateKey, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encryptionKey = await this.deriveKey(password, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      new TextEncoder().encode(privateKey)
    );

    this.vault = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      encryptedData: Array.from(new Uint8Array(encryptedData))
    };

    // Store encrypted vault instead of raw private key
    localStorage.setItem('zkauth_vault', JSON.stringify(this.vault));
  }

  async unlockVault(password) {
    try {
      const vault = JSON.parse(localStorage.getItem('zkauth_vault'));
      if (!vault) {
        throw new Error('No vault found - please register first');
      }

      const encryptionKey = await this.deriveKey(password, new Uint8Array(vault.salt));
      
      try {
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(vault.iv) },
          encryptionKey,
          new Uint8Array(vault.encryptedData)
        );

        this.unlockedPrivateKey = new TextDecoder().decode(decrypted);
        this.lastActivity = Date.now();
      } catch (error) {
        throw new Error('Invalid secret key');
      }
    } catch (error) {
      throw new Error(`Vault access denied: ${error.message}`);
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
} 