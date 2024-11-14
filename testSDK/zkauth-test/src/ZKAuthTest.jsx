import React, { useState } from 'react';
import { ZKAuthModal } from '@harsha614261/zkauth-sdk';

const ZKAuthTest = () => {
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (result) => {
    setMessage(`Authentication successful: ${JSON.stringify(result)}`);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>ZKAuth SDK Test</h1>
      <button onClick={() => setIsModalOpen(true)}>Open Auth Modal</button>
      {message && <p>{message}</p>}
      
      <ZKAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        apiKey="harsha614261"
      />
    </div>
  );
};

export default ZKAuthTest;