import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../services/api';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all'); // Keep this declaration
  const [formData, setFormData] = useState({
    name: '',
    position: 'Portiere', // Changed default to Portiere
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
        <h3>Caricamento giocatori...</h3>
      </Container>
    );
  }

  // Remove the duplicate roleFilter declaration that was here
  
  // No need to redefine roles here, use positions instead

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Giocatori</h2>
        <Button variant="success" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-1"></i> Nuovo Giocatore
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
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
              <td>{player.name}</td>
              <td>
                <Badge bg={
                  player.position === 'Portiere' ? 'warning' :
                  player.position === 'Difensore' ? 'success' :
                  player.position === 'Centrocampista' ? 'info' : 'danger'
                }>
                  {player.position}
                </Badge>
              </td>
              <td>{player.price}</td>
              <td>{player.total_points}</td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEditClick(player)}
                >
                  Modifica
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(player.id)}
                >
                  Elimina
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* Edit Player Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Giocatore</Modal.Title>
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
                min="1"
                required
              />
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
      
      {/* Add Player Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuovo Giocatore</Modal.Title>
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
                min="1"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button variant="success" type="submit">
              Crea Giocatore
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Update the role dropdown in the add/edit player form */}
      <Form.Group className="mb-3">
        <Form.Label>Ruolo</Form.Label>
        <Form.Select 
          value={formData.role} 
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          required
        >
          <option value="">Seleziona un ruolo</option>
          {positions.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </Form.Select>
      </Form.Group>
      
      {/* Update the role filter dropdown */}
      <Form.Group className="mb-3">
        <Form.Label>Filtra per ruolo</Form.Label>
        <Form.Select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tutti i ruoli</option>
          {positions.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </Form.Select>
      </Form.Group>
    </Container>
  );
};

export default AdminPlayers;