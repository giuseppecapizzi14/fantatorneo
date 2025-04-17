import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { register } from '../services/api';

const Register = ({ setIsAuthenticated, setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const { name, username, password, confirmPassword, role } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(name, username, password, role);
      
      // Redirect to admin users page
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center my-5">
        <Col md={6}>
          <h2 className="text-center mb-4">Registrazione Nuovo Utente</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Conferma Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
                minLength="6"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ruolo</Form.Label>
              <Form.Select
                name="role"
                value={role}
                onChange={onChange}
              >
                <option value="user">Utente</option>
                <option value="admin">Amministratore</option>
              </Form.Select>
            </Form.Group>
            
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Registrazione in corso...' : 'Registra Utente'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;