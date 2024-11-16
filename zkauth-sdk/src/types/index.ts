export interface ZKAuthConfig {
  apiKey: string;
  authUrl?: string;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export interface AuthResponse {
  message: string;
  code: string;
  token: string;
  publicKey: string;
  nonce: number;
  expiresIn: number;
}

export interface ProofData {
  r: string;
  s: string;
  publicKey: string;
}

export interface LoginParams {
  apiKey: string;
  secretKey: string;
  challenge: string;
} 