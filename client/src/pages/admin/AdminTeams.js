import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Badge, Spinner, Row, Col} from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaTrophy } from 'react-icons/fa';
import { getTeams, updateTeam, deleteTeam, createTeam } from '../../services/api';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    owner_id: '',
    total_points: 0
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      setTeams(res.data);
    } catch (err) {
      setError('Errore nel caricamento delle squadre');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Errore nel caricamento degli utenti', err);
    }
  };

  const handleEditClick = (team) => {
    setCurrentTeam(team);
    setFormData({
      name: team.name,
      owner_id: team.owner_id,
      total_points: team.total_points || 0
    });
    setShowEditModal(true);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      owner_id: '',
      total_points: 0
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (teamId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa squadra?')) {
      try {
        await deleteTeam(teamId);
        fetchTeams();
      } catch (err) {
        setError('Errore durante l\'eliminazione della squadra');
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'total_points' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTeam(currentTeam.id, formData);
      setShowEditModal(false);
      fetchTeams();
    } catch (err) {
      setError('Errore durante l\'aggiornamento della squadra');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTeam(formData);
      setShowAddModal(false);
      fetchTeams();
    } catch (err) {
      setError('Errore durante la creazione della squadra');
    }
  };

  if (loading && teams.length === 0) {
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
            padding: 0.4rem 0.5rem;
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
          <FaTrophy className="me-3" />
          Gestione Squadre
        </h2>
        <Button 
          variant="warning" 
          onClick={handleAddClick}
          className="d-flex align-items-center justify-content-center text-dark mx-auto mx-md-0"
          style={{ maxWidth: '180px' }}
        >
          <FaUserPlus className="me-2" /> Nuova Squadra
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        {teams.map(team => (
          <Col xs={12} md={6} lg={4} key={team.id} className="mb-4">
            <Card className="admin-card h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-warning">{team.name}</h5>
                <Badge bg="warning" className="text-dark">
                  <FaTrophy className="me-1" /> {team.total_points || 0} pt
                </Badge>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="text-white-50 mb-1">Proprietario:</div>
                  <div className="text-white">{team.owner_username}</div>
                </div>
                <div className="action-buttons mt-3">
                  <Button 
                    variant="warning" 
                    size="sm" 
                    className="text-dark d-flex align-items-center justify-content-center compact-btn"
                    onClick={() => handleEditClick(team)}
                  >
                    <FaEdit className="me-1" /> Modifica
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    className="d-flex align-items-center justify-content-center compact-btn"
                    onClick={() => handleDeleteClick(team.id)}
                  >
                    <FaTrash className="me-1" /> Elimina
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Edit Team Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        className="admin-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Modifica Squadra</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit} className="admin-form">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome Squadra</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Proprietario</Form.Label>
              <Form.Select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleziona un proprietario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Punti Totali</Form.Label>
              <Form.Control
                type="number"
                name="total_points"
                value={formData.total_points}
                onChange={handleInputChange}
                min="0"
              />
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
      
      {/* Add Team Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        className="admin-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Nuova Squadra</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit} className="admin-form">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome Squadra</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Proprietario</Form.Label>
              <Form.Select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleziona un proprietario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Punti Totali</Form.Label>
              <Form.Control
                type="number"
                name="total_points"
                value={formData.total_points}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button variant="warning" type="submit" className="text-dark">
              Crea Squadra
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminTeams;