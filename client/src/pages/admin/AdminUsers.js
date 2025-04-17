import React, { useState, useEffect } from 'react';
// Add Badge to the imports
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
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
        <h3>Caricamento utenti...</h3>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Utenti</h2>
        <Button variant="success" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-1"></i> Nuovo Utente
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Username</th>
            <th>Ruolo</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>
                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                  {user.role}
                </Badge>
              </td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEditClick(user)}
                >
                  Modifica
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(user.id)}
                >
                  Elimina
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Utente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
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
            <Button variant="primary" type="submit">
              Salva Modifiche
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuovo Utente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
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
            <Button variant="success" type="submit">
              Crea Utente
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminUsers;