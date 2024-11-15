import React, { useState } from 'react';
import { ZKAuth } from '../index.js';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  }
};

const ZKAuthModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  apiKey, 
}) => {
  const [mode, setMode] = useState('login'); 
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authUrl = 'http://localhost:3000/auth'
  // const authUrl = 'https://zk-auth-sdk-server.vercel.app/auth'
  const zkAuth = new ZKAuth({ apiKey, authUrl });

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!secretKey.trim()) {
      setError('Secret key is required');
      setLoading(false);
      return;
    }

    try {
      const challenge = await zkAuth.getChallenge();
      
      if (mode === 'register') {
        const result = await zkAuth.register(apiKey, secretKey, challenge);
        onSuccess({ mode: 'register', ...result });
      } else {
        await zkAuth.unlock(secretKey);
        const result = await zkAuth.login(apiKey, secretKey, challenge);
        onSuccess({ mode: 'login', ...result });
      }
    } catch (error) {
      if (error.message.includes('No vault found')) {
        setError('Please register first');
      } else if (error.message.includes('Invalid secret key')) {
        setError('Invalid secret key');
      } else if (error.message.includes('Vault access denied')) {
        setError('Access denied - please try again');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="password"
            placeholder="Secret Key"
            style={modalStyles.input}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          {error && <div style={modalStyles.error}>{error}</div>}
          <button 
            type="submit" 
            style={modalStyles.button}
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        <button
          style={modalStyles.button}
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </button>
        <button
          style={{ ...modalStyles.button, backgroundColor: '#dc3545' }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ZKAuthModal; 