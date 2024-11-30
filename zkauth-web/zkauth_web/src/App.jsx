import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Documentation from './pages/Documentation.jsx';
import ApiKeys from './pages/ApiKeys.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/api" element={<ApiKeys />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;