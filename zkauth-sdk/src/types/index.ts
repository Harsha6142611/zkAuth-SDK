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