import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { FaFutbol, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../services/api';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    position: 'Portiere',
    price: 0
  });

  // Update positions to only include the two roles
  const positions = ['Portiere', 'Giocatore di movimento'];

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await getPlayers();
      setPlayers(res.data);
    } catch (err) {
      setError('Errore nel caricamento dei giocatori');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (player) => {
    setCurrentPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      price: player.price
    });
    setShowEditModal(true);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      position: 'Attaccante',
      price: 10
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (playerId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      try {
        await deletePlayer(playerId);
        fetchPlayers();
      } catch (err) {
        setError('Errore durante l\'eliminazione del giocatore');
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'price' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePlayer(currentPlayer.id, formData);
      setShowEditModal(false);
      fetchPlayers();
    } catch (err) {
      setError('Errore durante l\'aggiornamento del giocatore');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPlayer(formData);
      setShowAddModal(false);
      fetchPlayers();
    } catch (err) {
      setError('Errore durante la creazione del giocatore');
    }
  };

  if (loading && players.length === 0) {
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
          .players-table th, .players-table td {
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
          }
          .players-table thead th {
            background-color: rgba(255, 208, 0, 0.2);
            color: rgb(255, 208, 0);
          }
        `}
      </style>
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="text-warning mb-3 mb-md-0">
          <FaFutbol className="me-2" />
          Gestione Giocatori
        </h2>
        <Button 
          variant="warning" 
          onClick={handleAddClick}
          className="d-flex align-items-center justify-content-center text-dark mx-auto mx-md-0"
          style={{ maxWidth: '180px' }}
        >
          <FaUserPlus className="me-2" /> Nuovo Giocatore
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="admin-card">
        <Card.Body>
          <Table responsive className="players-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Posizione</th>
                <th>Prezzo</th>
                <th>Punti Totali</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td className="text-warning">{player.name}</td>
                  <td>
                    <Badge bg={
                      player.position === 'Portiere' ? 'warning' :
                      player.position === 'Difensore' ? 'success' :
                      player.position === 'Centrocampista' ? 'info' : 'danger'
                    } className={player.position === 'Portiere' ? 'text-dark' : ''}>
                      {player.position}
                    </Badge>
                  </td>
                  <td>{player.price}</td>
                  <td>
                    <Badge bg="warning" className="text-dark">
                      {player.total_points || 0} pt
                    </Badge>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button 
                        variant="outline-warning" 
                        size="sm" 
                        className="compact-btn"
                        onClick={() => handleEditClick(player)}
                      >
                        <FaEdit /> Modifica
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="compact-btn"
                        onClick={() => handleDeleteClick(player.id)}
                      >
                        <FaTrash /> Elimina
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Edit Player Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Modifica Giocatore</Modal.Title>
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
              <Form.Label>Posizione</Form.Label>
              <Form.Select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Prezzo</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annulla
            </Button>
            <Button variant="warning" type="submit">
              Salva Modifiche
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Add Player Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Aggiungi Giocatore</Modal.Title>
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
              <Form.Label>Posizione</Form.Label>
              <Form.Select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Prezzo</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button variant="warning" type="submit">
              Aggiungi Giocatore
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminPlayers;