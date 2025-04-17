import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge, ListGroup } from 'react-bootstrap';
import { getMatchdays, createMatchday, getPlayersWithBonuses, updateBonuses, deleteMatchday, deleteBonus } from '../../services/api';

const AdminBonus = () => {
  const [matchdays, setMatchdays] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState(null);
  const [players, setPlayers] = useState([]);
  const [bonuses, setBonuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({});
  // Replace roleFilter with squadFilter
  const [squadFilter, setSquadFilter] = useState('all');
  // Add state to store unique squads
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

  // Fetch players with bonuses when a matchday is selected
  useEffect(() => {
    if (selectedMatchday) {
      fetchPlayersWithBonuses();
    }
  }, [selectedMatchday]);

  const fetchPlayersWithBonuses = async () => {
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
  };

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

  // Add state for filtering by role
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Add function to handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };
  
  // Add the missing handleSquadFilterChange function
  const handleSquadFilterChange = (e) => {
    setSquadFilter(e.target.value);
  };
  
  // Update this to filter by squad instead of role
  const filteredPlayers = squadFilter === 'all' 
    ? players 
    : players.filter(player => player.squad === squadFilter);

  return (
    <Container>
      <h2 className="my-4">Gestione Bonus</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4 text-center">
          <Form.Label style={{ fontSize: '0.9rem' }}>Seleziona Giornata</Form.Label>
          <Form.Select 
            value={selectedMatchday || ''} 
            onChange={handleMatchdayChange}
            required
            className="mx-auto"
            style={{ maxWidth: '300px' }}
          >
            <option value="">Seleziona una giornata</option>
            {matchdays.map(matchday => (
              <option key={matchday.id} value={matchday.id}>
                {matchday.name || `Giornata ${matchday.number}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        {selectedMatchday && (
          <>
            <h4>Bonus Giocatori</h4>
            
            <Form.Group className="mb-3 text-center">
              <Form.Label style={{ fontSize: '0.9rem' }}>Filtra per squadra</Form.Label>
              <Form.Select 
                value={squadFilter} 
                onChange={handleSquadFilterChange}
                className="mx-auto"
                style={{ maxWidth: '300px' }}
              >
                <option value="all">Tutte le squadre</option>
                {squads.map(squad => (
                  <option key={squad} value={squad}>
                    {squad}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <ListGroup className="mb-4">
              {filteredPlayers.map(player => (
                <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                  <div className="text-start" style={{ minWidth: '150px' }}>
                    <div>{player.name}</div>
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
                          variant="outline-primary" 
                          size="sm"
                          className="me-2"
                          onClick={() => savePlayerBonus(player.id)}
                          disabled={loading}
                        >
                          Salva
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => toggleEditMode(player.id)}
                          disabled={loading}
                        >
                          Annulla
                        </Button>
                      </>
                    ) : (
                      // Modalità di visualizzazione
                      <>
                        <span className="me-3 fw-bold">{player.matchday_points || 0} pt</span>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-2"
                          onClick={() => toggleEditMode(player.id)}
                          disabled={loading}
                        >
                          Modifica
                        </Button>
                        {player.matchday_points > 0 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteBonus(player.id)}
                            disabled={loading}
                          >
                            Elimina
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <Button type="submit" variant="primary" disabled={loading || Object.values(editMode).every(v => !v)}>
              {loading ? 'Salvataggio...' : 'Salva Tutti i Bonus in Modifica'}
            </Button>
          </>
        )}
      </Form>
    </Container>
  );
};

export default AdminBonus;