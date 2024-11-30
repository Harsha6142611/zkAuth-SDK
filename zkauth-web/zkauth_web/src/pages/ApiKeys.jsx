import { useState, useEffect } from 'react';
// import { ZKAuthModal } from '@harsha614261/zkauth-sdk';
import {ZKAuthModal} from "../../../../zkauth-sdk/src/index.js"
import './ApiKeys.css';

const ApiKeys = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [publicKey, setPublicKey] = useState(() => localStorage.getItem('publicKey') || '');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState({
    apiKey: false,
    publicKey: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleAuthSuccess = async (result) => {
    console.log('Raw Auth result:', result);
    try {
      if (result && result.publicKey) {
        // Call backend to get/generate API key
        const response = await fetch('http://localhost:3001/auth/generate-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: result.publicKey
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process API key');
        }

        const data = await response.json();
        
        // Store in localStorage
        localStorage.setItem('apiKey', data.apiKey);
        localStorage.setItem('publicKey', data.publicKey);
        localStorage.setItem('isAuthenticated', 'true');

        // Update state
        setApiKey(data.apiKey);
        setPublicKey(data.publicKey);
        setIsAuthenticated(true);
        setError('');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Auth success handling error:', err);
      setError(err.message || 'Failed to process authentication');
    }
  };

  const handleAuthError = (error) => {
    console.error('Auth error:', error);
    setError(error.message || 'Authentication failed');
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored data
    setIsAuthenticated(false);
    setApiKey('');
    setPublicKey('');
    setError('');
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({
        ...prev,
        [type]: true
      }));
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [type]: false
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const truncateKey = (key, length = 30) => {
    if (!key) return '';
    return key.length > length ? `${key.substring(0, length)}...` : key;
  };

  return (
    <div className="page-container">
      <div className="api-keys-container">
        <div className="keys-container">
          {isAuthenticated ? (
            <>
              <div className="key-card">
                <div className="key-header">
                  <h3>API Key</h3>
                  {apiKey && (
                    <button 
                      onClick={() => handleCopyToClipboard(apiKey, 'apiKey')} 
                      className={`copy-button ${copyStatus.apiKey ? 'copied' : ''}`}
                    >
                      <span className="copy-icon">📋</span>
                      {copyStatus.apiKey ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="key-value">{apiKey || 'No API key available'}</div>
              </div>

              <div className="key-card">
                <div className="key-header">
                  <h3>Public Key</h3>
                  {publicKey && (
                    <button 
                      onClick={() => handleCopyToClipboard(publicKey, 'publicKey')} 
                      className={`copy-button ${copyStatus.publicKey ? 'copied' : ''}`}
                    >
                      <span className="copy-icon">📋</span>
                      {copyStatus.publicKey ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="key-value">{truncateKey(publicKey) || 'No public key available'}</div>
              </div>

              <div className="logout-container">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="login-container">
              <h2>Welcome to ZKAuth</h2>
              <p>Please login to view your API keys</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="login-button"
              >
                Login with ZKAuth
              </button>
            </div>
          )}
        </div>
      </div>

      <ZKAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        apiKey="43a9cc3c6af852f6"
        redirectUrl={null}
      />
    </div>
  );
};

export default ApiKeys;