declare module '@harsha614261/zkauth-sdk' {
    export class ZKAuth {
      constructor(config: { apiKey: string; authUrl: string });
      getChallenge(): Promise<string>;
      generateKeyPair(secretKey: string): Promise<{ publicKey: string; privateKey: string }>;
      createProof(secretKey: string, challenge: string): Promise<string>;
      login(apiKey: string, publicKey: string, proof: string, challenge: string): Promise<any>;
    }
  }