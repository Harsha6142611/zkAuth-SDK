import React, { useState } from 'react';
import { ZKAuthModal } from '../../../../zkauth-sdk/src/index.js';

const ZKAuthTest = () => {
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (result) => {
    setMessage(`Authentication successful: ${JSON.stringify(result)}`);
    setIsModalOpen(false);
  };

  if (isModalOpen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <ZKAuthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          apiKey="harsha614261"
        />
      </div>
    );
  }

  return (
    <div>
      <h1>ZKAuth SDK Test</h1>
      <button onClick={() => setIsModalOpen(true)}>Open Auth Modal</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ZKAuthTest;