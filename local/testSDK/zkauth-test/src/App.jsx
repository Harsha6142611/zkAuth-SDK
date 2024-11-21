import React, { useState, useEffect } from 'react';
import { ChakraProvider, Button } from '@chakra-ui/react';
import { ZKAuthModal } from '../../../../zkauth-sdk/src/index.js';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authResult, setAuthResult] = useState(null);

  useEffect(() => {
    const storedAuthData = localStorage.getItem('zkauth_result');
    if (storedAuthData) {
      setAuthResult(JSON.parse(storedAuthData));
    }
  }, []);

  const handleAuthSuccess = (result) => {
    console.log('Authentication successful:', result);
    localStorage.setItem('zkauth_result', JSON.stringify(result));
    setAuthResult(result);
    setIsModalOpen(false);
  };

  const renderAuthStatus = (result) => {
    return (
      <div className="auth-status">
        <div className="mode-badge">{result.mode}</div>
        <div className="status-header">Authentication Successful</div>
        
        {result.publicKey && (
          <div className="status-item">
            <div className="status-label">Public Key:</div>
            <div className="public-key">{result.publicKey}</div>
          </div>
        )}
        
        {result.recoveryPhrase && (
          <div className="status-item">
            <div className="status-label">Recovery Phrase:</div>
            <div className="recovery-phrase">{result.recoveryPhrase}</div>
          </div>
        )}

        <Button 
          onClick={() => {
            localStorage.removeItem('zkauth_result');
            setAuthResult(null);
          }}
          mt={4}
          colorScheme="red"
        >
          Logout
        </Button>
      </div>
    );
  };

  return (
    <ChakraProvider>
      <div className="app-container">
        <div className="content-container">
          {!authResult && (
            <Button onClick={() => setIsModalOpen(true)}>
              Login
            </Button>
          )}

          {authResult && renderAuthStatus(authResult)}

          <ZKAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAuthSuccess}
            apiKey="your-api-key-here"
            redirectUrl="http://localhost:5173/auth/user"
          />
        </div>
      </div>
    </ChakraProvider>
  );
}

export default App;
