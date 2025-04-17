import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
// Import both login and API_URL
import { login, API_URL } from '../services/api';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Add these onChange handlers
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Remove the line that's trying to log API_URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with username:', username);
      // Remove this line that's causing the error
      // console.log('API URL:', `${API_URL}/auth/login`);
      const response = await login(username, password);
      console.log('Login response:', response);
      
      // Set authentication state
      setIsAuthenticated(true);
      setUser(response.data.user);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error details:', err);
      // Log more detailed error information
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Errore durante il login. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center my-5">
        <Col md={6}>
          <h2 className="text-center mb-4">Login</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Inserisci username" 
                value={username}
                onChange={handleUsernameChange}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Inserisci password" 
                value={password}
                onChange={handlePasswordChange}
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Caricamento...' : 'Login'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;