import { ec as EC } from 'elliptic';
import * as bip39 from 'bip39';

const ec = new EC('secp256k1');

export class CryptoUtils {
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

  static async generateKeyPair(secretKey) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(secretKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const privateKeyBytes = new Uint8Array(hashBuffer);
      const privateKey = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKeyPoint = keyPair.getPublic();
      const publicKey = '04' + 
        publicKeyPoint.getX().toString('hex') + 
        publicKeyPoint.getY().toString('hex');
      
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
      const { privateKey } = await this.generateKeyPair(secretKey);
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const msgHash = new Uint8Array(
        challenge.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      const signature = keyPair.sign(msgHash);
      
      return {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex')
      };
    } catch (error) {
      throw new Error(`Failed to create proof: ${error.message}`);
    }
  }

  static verifyProofLocally(publicKey, proof, challenge) {
    try {
      const formattedPublicKey = publicKey.startsWith('04') ? publicKey : '04' + publicKey;
      const msgHash = new Uint8Array(
        challenge.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      const key = ec.keyFromPublic(formattedPublicKey, 'hex');
      return key.verify(msgHash, {
        r: proof.r,
        s: proof.s
      });
    } catch (error) {
      throw error;
    }
  }
}
