import { randomBytes } from 'crypto';
import pkg from 'elliptic';
const { ec: EC } = pkg;

const ec = new EC('secp256k1');

export class CryptoUtils {
  // Server-side operations
  static generateChallenge() {
    return randomBytes(32).toString('hex');
  }

  static verifyProof(publicKey, proof, challenge) {
    try {
      // Ensure public key starts with '04' for uncompressed format
      const formattedPublicKey = publicKey.startsWith('04') ? publicKey : '04' + publicKey;
      
      console.log('Verifying proof with:', {
        original: publicKey.substring(0, 10) + '...',
        formatted: formattedPublicKey.substring(0, 10) + '...',
        length: formattedPublicKey.length
      });

      const challengeHash = Buffer.from(challenge, 'hex');
      const key = ec.keyFromPublic(formattedPublicKey, 'hex');
      
      const verificationResult = key.verify(challengeHash, {
        r: proof.r,
        s: proof.s
      });

      console.log('Verification result:', verificationResult);
      return verificationResult;
    } catch (error) {
      console.error('Detailed proof verification error:', error);
      return false;
    }
  }

  static generateSessionToken() {
    return randomBytes(32).toString('hex');
  }
}
