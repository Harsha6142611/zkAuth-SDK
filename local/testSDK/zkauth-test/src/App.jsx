import { useState } from 'react';
import './App.css';
// import { ZKAuthModal } from '../../../../zkauth-sdk/src/index.js';

import { ZKAuthModal } from '@harsha614261/zkauth-sdk';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);

  const handleAuthSuccess = (result) => {
    setAuthStatus(result);
    setIsModalOpen(false);
    alert(`Authentication Successful: Mode - ${result.mode}`);
  };

  return (
    <div className="app-container">
      <div className="content-container">
        <h1>ZKAuth Demo</h1>
        
        <button 
          className="auth-button"
          onClick={() => setIsModalOpen(true)}
        >
          Open Auth Modal
        </button>

        {authStatus && (
          <div className="auth-status">
            <strong style={{color: 'black'}}>Authentication Status:</strong>
            <p style={{color: 'black'}}>Mode: {authStatus.mode}</p>
            {authStatus.publicKey && (
              <p className="public-key">
                Public Key: {authStatus.publicKey}
              </p>
            )}
            {authStatus.recoveryPhrase && (
              <p className="recovery-phrase">
                Recovery Phrase: {authStatus.recoveryPhrase}
              </p>
            )}
          </div>
        )}
      </div>

      <ZKAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAuthSuccess}
        apiKey="your-api-key-here" // Replace with your actual API key
      />
    </div>
  );
}

export default App;
