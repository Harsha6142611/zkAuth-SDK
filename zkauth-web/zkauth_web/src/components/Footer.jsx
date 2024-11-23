import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About zkAuth</h3>
          <p>
            zkAuth is a cutting-edge authentication solution using zero-knowledge proofs
            to provide secure, private authentication for modern applications.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/api">API Reference</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li>Email: pasupulaharsha7006@gmail.com</li>
            <li>GitHub: <a href="https://github.com/Harsha6142611">@zkauth</a></li>
            <li>Portfolio: <a href="https://harshaportfolioblockchain.netlify.app/">@Harsha6142611</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Stay updated with our latest features and releases.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button className="primary-button">Subscribe</button>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} zkAuth. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;