import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FaUserCog, FaUserPlus, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import { getUsers, updateUser, deleteUser, register } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'user'
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Errore durante l\'eliminazione dell\'utente');
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(currentUser.id, formData);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setError('Errore durante l\'aggiornamento dell\'utente');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.username, formData.password, formData.role);
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      setError('Errore durante la creazione dell\'utente');
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <style>
        {`
          .admin-card {
            background-color: rgba(52, 58, 64, 0.7);
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
            margin-bottom: 1rem;
            transition: none !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .admin-card:hover {
            transform: none !important;
            box-shadow: none !important;
          }
          .admin-card .card-header {
            background-color: rgba(33, 37, 41, 0.5);
            border-color: rgba(255, 208, 0, 0.3);
          }
          .admin-modal .modal-content {
            background-color: #343a40;
            color: white;
          }
          .admin-modal .modal-header {
            border-bottom: 1px solid rgba(255, 208, 0, 0.3);
          }
          .admin-modal .modal-footer {
            border-top: 1px solid rgba(255, 208, 0, 0.3);
          }
          .admin-form .form-control, .admin-form .form-select {
            background-color: #212529;
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
          }
          .admin-form .form-control:focus, .admin-form .form-select:focus {
            border-color: rgb(255, 208, 0);
            box-shadow: 0 0 0 0.25rem rgba(255, 208, 0, 0.25);
          }
          .action-buttons {
            display: flex;
            gap: 0.5rem;
          }
          .compact-btn {
            padding: 0.25rem 0.5rem;
            border-radius: 0.2rem;
          }
          @media (max-width: 576px) {
            .action-buttons {
              flex-direction: center;
              width: 100%;
            }
            .action-buttons .btn {
              width: 100%;
              margin-bottom: 0.5rem;
            }
          }
        `}
      </style>
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="text-warning mb-3 mb-md-0">
          <FaUserCog className="me-2" />
          Gestione Utenti
        </h2>
        <Button 
          variant="warning" 
          onClick={handleAddClick}
          className="d-flex align-items-center justify-content-center text-dark mx-auto mx-md-0"
          style={{ maxWidth: '180px' }}
        >
          <FaUserPlus className="me-2" /> Nuovo Utente
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        {users.map(user => (
          <Col xs={12} key={user.id}>
            <Card className="admin-card">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                  <div className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="text-warning mb-0">{user.name}</h5>
                      <Badge bg={user.role === 'admin' ? 'warning' : 'info'} 
                             className={`ms-2 ${user.role === 'admin' ? 'text-dark' : ''}`}>
                        {user.role === 'admin' && <FaUserShield className="me-1" />}
                        {user.role}
                      </Badge>
                    </div>
                    <div className="text-white-50">Username:</div>
                    <div className="text-white-50">{user.username}</div>
                  </div>
                  
                  <div className="action-buttons">
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="text-dark d-flex align-items-center justify-content-center compact-btn"
                      onClick={() => handleEditClick(user)}
                    >
                      <FaEdit className="me-1" /> Modifica
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      className="d-flex align-items-center justify-content-center compact-btn"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <FaTrash className="me-1" /> Elimina
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Edit User Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        className="admin-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Modifica Utente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit} className="admin-form">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password (lascia vuoto per non modificare)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ruolo</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annulla
            </Button>
            <Button variant="warning" type="submit" className="text-dark">
              Salva Modifiche
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Add User Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        className="admin-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Nuovo Utente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit} className="admin-form">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ruolo</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button variant="warning" type="submit" className="text-dark">
              Crea Utente
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminUsers;