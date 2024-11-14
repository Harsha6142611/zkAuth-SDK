import pkg from 'elliptic';
const { ec: EC } = pkg;
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
      
      // Ensure public key is in uncompressed format (04 + x + y)
      const publicKey = publicKeyPoint.encode('hex', false);
      
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
      const challengeHash = Buffer.from(challenge, 'hex');
      const signature = keyPair.sign(challengeHash);
      
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
      const key = ec.keyFromPublic(publicKey, 'hex');
      const challengeHash = Buffer.from(challenge, 'hex');
      return key.verify(challengeHash, {
        r: proof.r,
        s: proof.s
      });
    } catch (error) {
      console.error('Local proof verification error:', error);
      return false;
    }
  }
}
