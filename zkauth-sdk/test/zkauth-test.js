import ZKAuth from '../src/zkauth.js';
import pkg from 'elliptic';
const { ec: EC } = pkg;

const testApiKey = 'harsha';
const testSecretKey = 'test_secret_key';

const config = {
  apiKey: testApiKey,
  authUrl: 'http://localhost:3000/auth'
};

const zkAuth = new ZKAuth(config);

async function testRegistration() {
  console.log("--- Testing Registration ---");

  try {
    console.log("Requesting challenge...");
    const challenge = await zkAuth.getChallenge();
    console.log("Challenge received:", challenge);

    // Try registration
    const result = await zkAuth.register(testApiKey, testSecretKey, challenge);
    console.log("Registration successful:", result);
  } catch (error) {
    if (error.message.includes('already registered')) {
      console.log("Note: User already exists -", error.message);
    } else {
      console.error("Registration Error:", error);
    }
  }
}

async function testLogin() {
  console.log("--- Testing Login ---");

  try {
    console.log("Requesting challenge...");
    const challenge = await zkAuth.getChallenge();
    console.log("Challenge received:", challenge);

    console.log("Generating key pair...");
    const keyPair = await zkAuth.generateKeyPair(testSecretKey);
    console.log("Key pair generated:", {
      publicKey: keyPair.publicKey.substring(0, 10) + '...',
      privateKeyLength: keyPair.privateKey.length
    });

    console.log("Creating proof...");
    const proof = await zkAuth.createProof(testSecretKey, challenge);
    console.log("Proof created:", {
      proofExists: !!proof,
      proofType: typeof proof,
      proofStructure: proof ? Object.keys(proof) : null
    });

    console.log("Attempting login...");
    const loginData = await zkAuth.login(
      testApiKey,
      keyPair.publicKey,
      proof,
      challenge
    );

    console.log("Login Successful:", loginData);
  } catch (error) {
    console.error("Login Error:", error.message);
  }
}

async function runTests() {
  console.log("Starting SDK tests...\n");

  // await testRegistration();
  await testLogin();

  console.log("\nSDK tests completed.");
}

runTests();
