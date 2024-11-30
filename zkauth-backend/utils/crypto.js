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
      if (!publicKey || !proof || !challenge) {
        console.error('Missing parameters:', { publicKey, proof, challenge });
        return false;
      }

      console.log('Verifying proof with:', {
        publicKey: publicKey.substring(0, 10) + '...',
        challenge: challenge.substring(0, 10) + '...',
        proof: {
          r: proof.r.substring(0, 10) + '...',
          s: proof.s.substring(0, 10) + '...'
        }
      });

      if (!proof.r || !proof.s) {
        console.error('Invalid proof format:', proof);
        return false;
      }

      const cleanPublicKey = publicKey.startsWith('04') ? publicKey.slice(2) : publicKey;
      const key = ec.keyFromPublic(cleanPublicKey, 'hex');
      const challengeBuffer = Buffer.from(challenge, 'hex');
      
      const verificationResult = key.verify(challengeBuffer, {
        r: proof.r,
        s: proof.s
      });

      console.log('Verification details:', {
        publicKey: cleanPublicKey,
        challenge,
        result: verificationResult
      });

      return verificationResult;
    } catch (error) {
      console.error('Proof verification error:', error);
      return false;
    }
  }

  static generateSessionToken() {
    return randomBytes(32).toString('hex');
  }
}
