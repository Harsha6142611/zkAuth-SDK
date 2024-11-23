export const generateApiKey = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('zkauth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API key generation failed:', error);
      throw error;
    }
  };