import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyZKAuthToken } from './auth.js';
import Todo from './Todo.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pasupulaharsha7006:NTvmr26C54fKaxql@cluster0.2xnmm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Todo routes
app.get('/api/todos', verifyZKAuthToken, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.publicKey });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', verifyZKAuthToken, async (req, res) => {
  try {
    const todo = new Todo({
      userId: req.user.publicKey,
      text: req.body.text
    });
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/todos/:id', verifyZKAuthToken, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.publicKey },
      { completed: req.body.completed },
      { new: true }
    );
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/todos/:id', verifyZKAuthToken, async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id, userId: req.user.publicKey });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));