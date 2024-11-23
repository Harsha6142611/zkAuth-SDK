const RightPanel = () => {
    return (
      <div className="bg-[#1a1a1a] text-white p-8 right-content" style={{ 
        minHeight: `calc(100vh - 50px)`, 
        // marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className="space-y-6" style={{ maxWidth: '800px' }}>
          {/* Installation Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Installation</h3>
            <div className="bg-[#2d2d2d] p-4 rounded-md">
              <code>npm install @harsha614261/zk-auth</code>
            </div>
          </div>
  
          {/* Usage Example Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
            <div className="bg-[#2d2d2d] p-4 rounded-md">
              <pre className="text-sm">
                <code>{`import { ZKAuth } from '@harsha614261/zk-auth';
  
  // Initialize ZKAuth
  const zkAuth = new ZKAuth({
    apiKey: 'your_api_key',
    endpoint: 'your_endpoint'
  });
  

  async function authenticate() {
    try {
      const proof = await zkAuth.generateProof({
        userId: 'user123',
        challenge: 'challenge_string'
      });
      
      const isValid = await zkAuth.verifyProof(proof);
      if (isValid) {
        console.log('Authentication successful!');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default RightPanel;