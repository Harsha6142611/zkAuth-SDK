import './Home.css';
import RightPanel from '../components/RightPanel';

const features = [
  {
    title: 'Zero Knowledge Proofs',
    description: 'Authenticate users without exposing sensitive data'
  },
  {
    title: 'Enhanced Security',
    description: 'Military-grade encryption for your authentication needs'
  },
  {
    title: 'Simple Integration',
    description: 'Easy to implement with just a few lines of code'
  }
];

const Home = () => {
  return (
    <main>
      <div className="flex">
        {/* Left side content */}
        <div className="w-1/2 left-content" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="hero-section">
            <div className="container">
              <div className="hero-content">
                <h1>Secure Authentication with Zero Knowledge</h1>
                <p>
                  zkAuth provides a simple and secure way to implement authentication
                  using zero knowledge proofs. Protect your users' data while maintaining
                  a seamless experience.
                </p>
                <div className="button-group">
                  <button className="primary-button">Get Started</button>
                  <button className="secondary-button">View Documentation</button>
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <div className="container">
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side panel */}
        <div className="w-1/2">
          <RightPanel />
        </div>
      </div>
    </main>
  );
};

export default Home;