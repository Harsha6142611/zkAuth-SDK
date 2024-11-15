export interface ZKAuthConfig {
  apiKey: string;
  authUrl?: string;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  publicKey: string;
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