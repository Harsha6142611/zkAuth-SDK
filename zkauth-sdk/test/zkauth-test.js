// zkauth-sdk/tests/zkauth.test.js
import ZKAuth from '../src/zkauth';

const zkauth = new ZKAuth({
  apiKey: 'test_api_key',
  authUrl: 'https://mock-auth-url.com'
});

test('should generate key pair from secret key', () => {
  const secretKey = 'testSecretKey';
  const { publicKey, privateKey } = zkauth.generateKeys(secretKey);

  expect(publicKey).toBeDefined();
  expect(privateKey).toBeDefined();
});

test('should generate proof for registration', async () => {
  const secretKey = 'testSecretKey';
  const { publicKey, proof } = await zkauth.register({ secretKey });

  expect(publicKey).toBeDefined();
  expect(proof).toBeDefined();
});
