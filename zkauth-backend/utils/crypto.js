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
      const key = ec.keyFromPublic(publicKey, 'hex');
      const challengeHash = Buffer.from(challenge, 'hex');
      
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
