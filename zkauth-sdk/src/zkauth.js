import crypto from 'crypto-js';
import elliptic from 'elliptic';

const EC = new elliptic.ec('secp256k1');

class ZKAuth {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.authUrl = config.authUrl;
  }

  generateKeys(secretKey) {
    const ecKey = EC.keyFromPrivate(secretKey);
    const publicKey = ecKey.getPublic('hex');
    const privateKey = ecKey.getPrivate('hex');
    return { publicKey, privateKey };
  }

  async register(secretKey) {
    const { publicKey, privateKey } = this.generateKeys(secretKey);
    // Generate zero-knowledge proof or hashed data from the public key

    const registrationData = { apiKey: this.apiKey, publicKey };
    // Make a request to the backend
    return fetch(`${this.authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
  }

  async login(secretKey) {
    const { publicKey } = this.generateKeys(secretKey);
    const loginData = { apiKey: this.apiKey, publicKey };
    return fetch(`${this.authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
  }
}

export default ZKAuth;
