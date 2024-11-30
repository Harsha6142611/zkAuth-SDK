import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">zkAuth</Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/docs" className="nav-link">Docs</Link>
          <Link to="/api" className="nav-link">API</Link>
        </div>

        <button className="primary-button">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;