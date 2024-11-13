import { randomBytes } from 'crypto';
import * as bip39 from 'bip39';
import pkg from 'elliptic';
const { ec: EC } = pkg;

const ec = new EC('secp256k1');

export class CryptoUtils {
  static async generateKeyPair(secretKey) {
    try {
      // Convert secretKey to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(secretKey);
      
      // Use Web Crypto API to create hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const privateKeyBytes = new Uint8Array(hashBuffer);
      
      // Convert to hex string
      const privateKey = Buffer.from(privateKeyBytes).toString('hex');
      
      console.log('Generated private key:', {
        length: privateKey.length,
        preview: privateKey.substring(0, 10) + '...'
      });
      
      // Generate key pair using elliptic
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKeyPoint = keyPair.getPublic();
      const publicKey = '04' + publicKeyPoint.getX().toString('hex') + publicKeyPoint.getY().toString('hex');
      
      return {
        privateKey,
        publicKey
      };
    } catch (error) {
      console.error('Key pair generation error:', error);
      throw new Error(`Failed to generate key pair: ${error.message}`);
    }
  }

  static generateRecoveryPhrase() {
    const entropy = randomBytes(16);
    return bip39.entropyToMnemonic(entropy);
  }

  static recoverFromPhrase(recoveryPhrase) {
    const seed = bip39.mnemonicToSeedSync(recoveryPhrase);
    const keyPair = ec.keyFromPrivate(seed.slice(0, 32));
    
    return {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic('hex')
    };
  }

  static async createProof(secretKey, challenge) {
    try {
      console.log('Creating proof with:', {
        secretKeyLength: secretKey.length,
        challengeLength: challenge.length
      });

      // First generate the key pair from the secret key
      const { privateKey } = await this.generateKeyPair(secretKey);
      console.log('Private key for proof:', {
        length: privateKey.length,
        format: 'hex'
      });

      // Convert challenge to buffer
      const challengeHash = Buffer.from(challenge, 'hex');
      
      // Create key pair from private key
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      
      // Sign the challenge
      const signature = keyPair.sign(challengeHash);
      
      // Create the proof
      const proof = {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex')
      };

      console.log('Generated proof:', {
        r: proof.r.substring(0, 10) + '...',
        s: proof.s.substring(0, 10) + '...'
      });

      return proof;
    } catch (error) {
      console.error('Error creating proof:', error);
      throw new Error(`Failed to create proof: ${error.message}`);
    }
  }

  static verifyProofLocally(publicKey, proof, challenge) {
    try {
      // Ensure public key starts with '04' for uncompressed format
      const formattedPublicKey = publicKey.startsWith('04') ? publicKey : '04' + publicKey;
      
      console.log('Verifying with formatted public key:', {
        original: publicKey.substring(0, 10) + '...',
        formatted: formattedPublicKey.substring(0, 10) + '...',
        length: formattedPublicKey.length
      });

      const challengeHash = Buffer.from(challenge, 'hex');
      const key = ec.keyFromPublic(formattedPublicKey, 'hex');
      
      const isValid = key.verify(challengeHash, {
        r: proof.r,
        s: proof.s
      });
      
      console.log('Local verification result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Local proof verification error:', error);
      throw error;
    }
  }
};
