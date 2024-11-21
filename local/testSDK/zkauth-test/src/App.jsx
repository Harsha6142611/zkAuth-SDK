import React, { useState, useEffect } from 'react';
import { ChakraProvider, Button, Input, Box, VStack, HStack, Text, Checkbox } from '@chakra-ui/react';
import { ZKAuthModal } from '../../../../zkauth-sdk/src/index.js';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const storedAuthData = localStorage.getItem('zkauth_result');
    if (storedAuthData) {
      setAuthResult(JSON.parse(storedAuthData));
    }
  }, []);

  useEffect(() => {
    if (authResult) {
      fetchTodos();
    }
  }, [authResult]);

  const fetchTodos = async () => {
    const response = await fetch('http://localhost:3001/api/todos', {
      headers: {
        'Authorization': `Bearer ${btoa(JSON.stringify(authResult))}`
      }
    });
    const data = await response.json();
    setTodos(data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const response = await fetch('http://localhost:3001/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${btoa(JSON.stringify(authResult))}`
      },
      body: JSON.stringify({ text: newTodo })
    });
    const todo = await response.json();
    setTodos([...todos, todo]);
    setNewTodo('');
  };

  const toggleTodo = async (id, completed) => {
    const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${btoa(JSON.stringify(authResult))}`
      },
      body: JSON.stringify({ completed })
    });
    const updatedTodo = await response.json();
    setTodos(todos.map(todo => 
      todo._id === id ? updatedTodo : todo
    ));
  };

  const deleteTodo = async (id) => {
    await fetch(`http://localhost:3001/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${btoa(JSON.stringify(authResult))}`
      }
    });
    setTodos(todos.filter(todo => todo._id !== id));
  };

  const handleAuthSuccess = (result) => {
    console.log('Authentication successful:', result);
    localStorage.setItem('zkauth_result', JSON.stringify(result));
    setAuthResult(result);
    setIsModalOpen(false);
  };

  const renderAuthStatus = (result) => {
    return (
      <div className="auth-status">
        <div className="mode-badge">{result.mode}</div>
        <div className="status-header">Authentication Successful</div>
        
        {result.publicKey && (
          <div className="status-item">
            <div className="status-label">Public Key:</div>
            <div className="public-key">{result.publicKey}</div>
          </div>
        )}
        
        {result.recoveryPhrase && (
          <div className="status-item">
            <div className="status-label">Recovery Phrase:</div>
            <div className="recovery-phrase">{result.recoveryPhrase}</div>
          </div>
        )}

        <Button 
          onClick={() => {
            localStorage.removeItem('zkauth_result');
            setAuthResult(null);
          }}
          mt={4}
          colorScheme="red"
        >
          Logout
        </Button>
      </div>
    );
  };

  return (
    <ChakraProvider>
      <div className="app-container">
        <div className="content-container">
          {!authResult ? (
            <Button onClick={() => setIsModalOpen(true)}>
              Login
            </Button>
          ) : (
            <VStack spacing={4} width="100%">
              {/* Auth Status */}
              {renderAuthStatus(authResult)}
              
              {/* Todo Input */}
              <form onSubmit={addTodo} style={{ width: '100%' }}>
                <HStack>
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo"
                    bg="white"
                  />
                  <Button type="submit" colorScheme="blue">Add</Button>
                </HStack>
              </form>

              {/* Todo List */}
              <VStack align="stretch" width="100%" spacing={2}>
                {todos.map(todo => (
                  <HStack key={todo._id} p={2} bg="white" borderRadius="md">
                    <Checkbox
                      isChecked={todo.completed}
                      onChange={(e) => toggleTodo(todo._id, e.target.checked)}
                    />
                    <Text flex={1} textDecoration={todo.completed ? 'line-through' : 'none'}>
                      {todo.text}
                    </Text>
                    <Button size="sm" colorScheme="red" onClick={() => deleteTodo(todo._id)}>
                      Delete
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          )}

          <ZKAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAuthSuccess}
            apiKey="harsha614261"
            redirectUrl="http://localhost:5173/auth/user"
          />
        </div>
      </div>
    </ChakraProvider>
  );
}

export default App;
