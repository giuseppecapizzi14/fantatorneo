import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';

// Import the login function from your services
import { login } from '../services/api';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Now the login function is properly imported and can be used
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setUser(response.data.user);
      
      // Reindirizza sempre alla dashboard, indipendentemente dal ruolo
      navigate('/home');
    } catch (err) {
      setError('Username o password non validi');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center my-5">
        <Col md={6}>
          <div className="admin-card p-4 rounded">
            <div className="text-center mb-4">
              <FaUser size={40} className="text-warning mb-3" />
              <h2 className="mb-0">Login</h2>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <div className="input-group">
                  <span className="input-group-text text-warning">
                    <FaUser />
                  </span>
                  <Form.Control 
                    type="text" 
                    placeholder="Inserisci username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text text-warning">
                    <FaLock />
                  </span>
                  <Form.Control 
                    type="password" 
                    placeholder="Inserisci password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="warning" 
                  type="submit" 
                  disabled={loading}
                  className="py-2"
                >
                  {loading ? 'Caricamento...' : 'Accedi'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
