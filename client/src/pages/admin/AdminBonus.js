import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaTrophy, FaFutbol, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { getMatches, getPlayersWithBonuses, updateBonuses, deleteBonus } from '../../services/api';

const AdminBonus = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [bonuses, setBonuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({});
  const [currentMatch, setCurrentMatch] = useState(null);

  // Fetch matches when component mounts
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await getMatches();
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      setError('Errore durante il recupero delle partite');
      setLoading(false);
    }
  };

  const fetchPlayersWithBonuses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the current match details
      const matchDetails = matches.find(m => m.id === selectedMatch);
      setCurrentMatch(matchDetails);
      
      const response = await getPlayersWithBonuses(selectedMatch);
      setPlayers(response.data);
      
      // Initialize bonuses object and edit mode from response data
      const initialBonuses = {};
      const initialEditMode = {};
      
      response.data.forEach(player => {
        initialBonuses[player.id] = player.match_points || 0;
        // Se il giocatore ha già un bonus per questa partita, non è in modalità di modifica
        initialEditMode[player.id] = player.match_points === 0 || player.match_points === null;
      });
      setBonuses(initialBonuses);
      setEditMode(initialEditMode);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching players with bonuses:', err);
      setError('Errore durante il recupero dei giocatori');
      setLoading(false);
    }
  }, [selectedMatch, matches]);

  // Fetch players with bonuses when a match is selected
  useEffect(() => {
    if (selectedMatch) {
      fetchPlayersWithBonuses();
    }
  }, [selectedMatch, fetchPlayersWithBonuses]);

  const handleMatchChange = (e) => {
    setSelectedMatch(parseInt(e.target.value, 10));
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
      
      await updateBonuses(selectedMatch, bonusData);
      
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
      
      await deleteBonus(selectedMatch, playerId);
      
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
      
      await updateBonuses(selectedMatch, bonusData);
      
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

  if (loading && players.length === 0 && !selectedMatch) {
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
          .team-header {
            background-color: rgba(33, 37, 41, 0.8);
            color: white;
            padding: 0.5rem;
            margin-bottom: 1rem;
            border-radius: 0.25rem;
            border-left: 4px solid rgba(255, 208, 0, 0.8);
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
                  <Form.Label className="text-warning">Seleziona Partita</Form.Label>
                  <Form.Select 
                    value={selectedMatch || ''} 
                    onChange={handleMatchChange}
                    required
                    className="mx-auto"
                    style={{ maxWidth: '240px' }}
                  >
                    <option value="">Seleziona una partita</option>
                    {matches.map(match => (
                      <option key={match.id} value={match.id}>
                        {match.home_team} - {match.away_team}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {selectedMatch && currentMatch && (
              <>
                <h4 className="text-warning mb-3">
                  <FaFutbol className="me-2" />
                  {currentMatch.home_team} vs {currentMatch.away_team}
                </h4>
                
                {loading && (
                  <div className="text-center my-4">
                    <Spinner animation="border" variant="warning" />
                  </div>
                )}
                
                {/* Dividi i giocatori per squadra */}
                {!loading && players.length > 0 && (
                  <>
                    {/* Squadra di casa */}
                    <div className="team-header">
                      <h5 className="mb-0">{currentMatch.home_team}</h5>
                    </div>
                    <ListGroup className="mb-4">
                      {players
                        .filter(player => player.squad === currentMatch.home_team)
                        .map(player => (
                          <ListGroup.Item key={player.id} className="bonus-list-item d-flex justify-content-between align-items-center">
                            <div className="text-start" style={{ minWidth: '150px' }}>
                              <div className="text-warning">{player.name}</div>
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
                                  <span className="me-3 badge bonus-badge px-3 py-2">{player.match_points || 0} pt</span>
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
                                  {player.match_points > 0 && (
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
                    
                    {/* Squadra ospite */}
                    <div className="team-header">
                      <h5 className="mb-0">{currentMatch.away_team}</h5>
                    </div>
                    <ListGroup className="mb-4">
                      {players
                        .filter(player => player.squad === currentMatch.away_team)
                        .map(player => (
                          <ListGroup.Item key={player.id} className="bonus-list-item d-flex justify-content-between align-items-center">
                            <div className="text-start" style={{ minWidth: '150px' }}>
                              <div className="text-warning">{player.name}</div>
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
                                  <span className="me-3 badge bonus-badge px-3 py-2">{player.match_points || 0} pt</span>
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
                                  {player.match_points > 0 && (
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
                  </>
                )}
                
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
