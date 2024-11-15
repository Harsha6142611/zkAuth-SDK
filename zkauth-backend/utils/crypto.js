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
      const cleanPublicKey = publicKey.startsWith('04') ? publicKey.slice(2) : publicKey;
      const key = ec.keyFromPublic(cleanPublicKey, 'hex');
      
      const challengeBuffer = Buffer.from(challenge, 'hex');
      
      const verificationResult = key.verify(challengeBuffer, {
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
