import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaTrophy, FaFutbol, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { getMatchdays, getPlayersWithBonuses, updateBonuses, deleteBonus } from '../../services/api';

const AdminBonus = () => {
  const [matchdays, setMatchdays] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState(null);
  const [players, setPlayers] = useState([]);
  const [bonuses, setBonuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({});
  const [squadFilter, setSquadFilter] = useState('all');
  const [squads, setSquads] = useState([]);

  // Fetch matchdays when component mounts
  useEffect(() => {
    fetchMatchdays();
  }, []);

  const fetchMatchdays = async () => {
    try {
      setLoading(true);
      const response = await getMatchdays();
      setMatchdays(response.data);
      setLoading(false);
    } catch (err) {
      setError('Errore durante il recupero delle giornate');
      setLoading(false);
    }
  };

  const fetchPlayersWithBonuses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPlayersWithBonuses(selectedMatchday);
      setPlayers(response.data);
      
      // Initialize bonuses object and edit mode from response data
      const initialBonuses = {};
      const initialEditMode = {};
      
      // Extract unique squads from players
      const uniqueSquads = [...new Set(response.data
        .map(player => player.squad)
        .filter(squad => squad))]; // Filter out null/undefined values
      
      setSquads(uniqueSquads);
      
      response.data.forEach(player => {
        initialBonuses[player.id] = player.matchday_points || 0;
        // Se il giocatore ha già un bonus per questa giornata, non è in modalità di modifica
        initialEditMode[player.id] = player.matchday_points === 0 || player.matchday_points === null;
      });
      setBonuses(initialBonuses);
      setEditMode(initialEditMode);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching players with bonuses:', err);
      setError('Errore durante il recupero dei giocatori');
      setLoading(false);
    }
  }, [selectedMatchday]);

  // Fetch players with bonuses when a matchday is selected
  useEffect(() => {
    if (selectedMatchday) {
      fetchPlayersWithBonuses();
    }
  }, [selectedMatchday, fetchPlayersWithBonuses]);

  const handleMatchdayChange = (e) => {
    setSelectedMatchday(parseInt(e.target.value, 10));
    setSuccess('');
    setError('');
  };

  // Update to handle bonus change for a specific player
  const handleBonusChange = (playerId, value) => {
    setBonuses({
      ...bonuses,
      [playerId]: parseInt(value) || 0
    });
  };

  // Toggle edit mode for a player
  const toggleEditMode = (playerId) => {
    setEditMode({
      ...editMode,
      [playerId]: !editMode[playerId]
    });
  };

  // Save bonus for a specific player
  const savePlayerBonus = async (playerId) => {
    try {
      setLoading(true);
      
      // Create array with just this player's bonus
      const bonusData = {
        bonuses: [{
          playerId: parseInt(playerId),
          points: bonuses[playerId],
          updateTeams: true
        }]
      };
      
      await updateBonuses(selectedMatchday, bonusData);
      
      // Disattiva la modalità di modifica dopo il salvataggio
      setEditMode({
        ...editMode,
        [playerId]: false
      });
      
      setSuccess(`Bonus aggiornato per il giocatore e punteggi delle squadre ricalcolati`);
      setLoading(false);
      
      // Aggiorna i dati per riflettere i cambiamenti
      fetchPlayersWithBonuses();
    } catch (err) {
      console.error('Error updating bonus:', err);
      setError(`Errore durante l'aggiornamento del bonus`);
      setLoading(false);
    }
  };

  // Delete bonus for a specific player
  const handleDeleteBonus = async (playerId) => {
    try {
      if (!window.confirm('Sei sicuro di voler eliminare questo bonus?')) {
        return;
      }
      
      setLoading(true);
      
      await deleteBonus(selectedMatchday, playerId);
      
      setSuccess(`Bonus eliminato per il giocatore`);
      setLoading(false);
      
      // Aggiorna i dati per riflettere i cambiamenti
      fetchPlayersWithBonuses();
    } catch (err) {
      console.error('Error deleting bonus:', err);
      setError(`Errore durante l'eliminazione del bonus`);
      setLoading(false);
    }
  };

  // Save all bonuses at once
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert bonuses object to array of player bonuses
      const bonusData = {
        bonuses: Object.keys(bonuses)
          .filter(playerId => editMode[playerId]) // Solo i giocatori in modalità di modifica
          .map(playerId => ({
            playerId: parseInt(playerId),
            points: bonuses[playerId],
            updateTeams: true
          })),
        updateLeaderboard: true
      };
      
      if (bonusData.bonuses.length === 0) {
        setError('Nessun bonus da aggiornare');
        setLoading(false);
        return;
      }
      
      await updateBonuses(selectedMatchday, bonusData);
      
      // Disattiva la modalità di modifica per tutti i giocatori
      const newEditMode = {};
      Object.keys(editMode).forEach(playerId => {
        newEditMode[playerId] = false;
      });
      setEditMode(newEditMode);
      
      setSuccess('Tutti i bonus sono stati aggiornati con successo e la classifica è stata ricalcolata');
      setLoading(false);
      
      // Aggiorna i dati per riflettere i cambiamenti
      fetchPlayersWithBonuses();
    } catch (err) {
      console.error('Error updating all bonuses:', err);
      setError('Errore durante l\'aggiornamento dei bonus');
      setLoading(false);
    }
  };

  const handleSquadFilterChange = (e) => {
    setSquadFilter(e.target.value);
  };
  
  // Filtra i giocatori in base alla squadra selezionata
  const filteredPlayers = squadFilter === 'all' 
    ? players 
    : players.filter(player => player.squad === squadFilter);

  if (loading && players.length === 0 && !selectedMatchday) {
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
          .admin-form .form-control, .admin-form .form-select {
            background-color: #212529;
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
          }
          .admin-form .form-control:focus, .admin-form .form-select:focus {
            border-color: rgb(255, 208, 0);
            box-shadow: 0 0 0 0.25rem rgba(255, 208, 0, 0.25);
          }
          .bonus-list-item {
            background-color: rgba(52, 58, 64, 0.7);
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
            margin-bottom: 0.5rem;
          }
          .bonus-list-item:hover {
            background-color: rgba(52, 58, 64, 0.9);
          }
          .bonus-badge {
            background-color: rgba(255, 208, 0, 0.8);
            color: #212529;
            font-weight: bold;
          }
          .action-buttons {
            display: flex;
            gap: 0.5rem;
          }
          .compact-btn {
            padding: 0.4rem 0.5rem;
            border-radius: 0.2rem;
          }
        `}
      </style>
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="text-warning mb-3 mb-md-0">
          <FaTrophy className="me-3" />
          Gestione Bonus
        </h2>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="admin-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit} className="admin-form">
            <Row className="mb-4">
              <Col md={6} className="mx-auto">
                <Form.Group className="mb-3 text-center">
                  <Form.Label className="text-warning">Seleziona Giornata</Form.Label>
                  <Form.Select 
                    value={selectedMatchday || ''} 
                    onChange={handleMatchdayChange}
                    required
                    className="mx-auto"
                    style={{ maxWidth: '140px' }}
                  >
                    <option value="">Seleziona una giornata</option>
                    {matchdays.map(matchday => (
                      <option key={matchday.id} value={matchday.id}>
                        {matchday.name || `Giornata ${matchday.number}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {selectedMatchday && (
              <>
                <h4 className="text-warning mb-3">
                  <FaFutbol className="me-2" />
                  Bonus Giocatori
                </h4>
                
                <Row className="mb-4">
                  <Col md={6} className="mx-auto">
                    <Form.Group className="mb-3 text-center">
                      <Form.Label className="text-warning">Filtra per squadra</Form.Label>
                      <Form.Select 
                        value={squadFilter} 
                        onChange={handleSquadFilterChange}
                        className="mx-auto"
                        style={{ maxWidth: '180px' }}
                      >
                        <option value="all">Tutte le squadre</option>
                        {squads.map(squad => (
                          <option key={squad} value={squad}>
                            {squad}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {loading && (
                  <div className="text-center my-4">
                    <Spinner animation="border" variant="warning" />
                  </div>
                )}
                
                <ListGroup className="mb-4">
                  {filteredPlayers.map(player => (
                    <ListGroup.Item key={player.id} className="bonus-list-item d-flex justify-content-between align-items-center">
                      <div className="text-start" style={{ minWidth: '150px' }}>
                        <div className="text-warning">{player.name}</div>
                        {player.squad && (
                          <div>
                            <Badge bg="secondary" className="mt-1">
                              {player.squad}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center">
                        {editMode[player.id] ? (
                          // Modalità di modifica
                          <>
                            <Form.Group className="mb-0 me-2" style={{ width: '100px' }}>
                              <Form.Control
                                type="number"
                                value={bonuses[player.id] || 0}
                                onChange={(e) => handleBonusChange(player.id, e.target.value)}
                                min="-10"
                                max="10"
                              />
                            </Form.Group>
                            <Button 
                              variant="warning" 
                              size="sm"
                              className="me-2 d-flex align-items-center justify-content-center"
                              onClick={() => savePlayerBonus(player.id)}
                              disabled={loading}
                              style={{ width: '38px', height: '38px', padding: '0' }}
                            >
                              <FaSave />
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              className="d-flex align-items-center justify-content-center"
                              onClick={() => toggleEditMode(player.id)}
                              disabled={loading}
                              style={{ width: '38px', height: '38px', padding: '0' }}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        ) : (
                          // Modalità di visualizzazione
                          <>
                            <span className="me-3 badge bonus-badge px-3 py-2">{player.matchday_points || 0} pt</span>
                            <Button 
                              variant="outline-warning" 
                              size="sm"
                              className="me-2 d-flex align-items-center justify-content-center"
                              onClick={() => toggleEditMode(player.id)}
                              disabled={loading}
                              style={{ width: '38px', height: '38px', padding: '0' }}
                            >
                              <FaEdit />
                            </Button>
                            {player.matchday_points > 0 && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center"
                                onClick={() => handleDeleteBonus(player.id)}
                                disabled={loading}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                {Object.values(editMode).some(v => v) && (
                  <div className="text-center">
                    <Button 
                      type="submit" 
                      variant="warning" 
                      className="px-4 d-flex align-items-center justify-content-center mx-auto"
                      disabled={loading || Object.values(editMode).every(v => !v)}
                      style={{ minWidth: '200px' }}
                    >
                      {loading ? <Spinner size="sm" animation="border" /> : 'Salva Tutti i Bonus in Modifica'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminBonus;