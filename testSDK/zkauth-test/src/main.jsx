import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ZKAuthTest from './ZKAuthTest';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ZKAuthTest />
  </StrictMode>,
)
