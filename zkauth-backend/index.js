import express from 'express';
import bodyParser from 'body-parser';
import { register, login } from './controllers/authController.js';  // Import functions directly

const app = express();
app.use(bodyParser.json());

// Routes
app.post('/auth/register', register);
app.post('/auth/login', login);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`ZKAuth backend running on http://localhost:${PORT}`);
});
