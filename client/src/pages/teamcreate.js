import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPlayers, createTeam } from '../services/api';

const TeamCreate = () => {
  // Budget state variables
  const [totalBudget] = useState(250); // Set budget to 250
  const [remainingBudget, setRemainingBudget] = useState(250);
  
  // Team and player state
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedGoalkeepers, setSelectedGoalkeepers] = useState([]);
  const [selectedOutfieldPlayers, setSelectedOutfieldPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Add this line to define the success state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await getPlayers();
        setPlayers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Errore durante il recupero dei giocatori');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handlePlayerSelect = (player) => {
    if (!player || !player.id) {
      console.error('Attempted to select invalid player:', player);
      return;
    }
    
    if (selectedPlayers.includes(player.id)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
      
      // Update budget when removing a player
      setRemainingBudget(remainingBudget + player.price);
      
      if (player.position === "Portiere") {
        setSelectedGoalkeepers(selectedGoalkeepers.filter(id => id !== player.id));
      } else {
        setSelectedOutfieldPlayers(selectedOutfieldPlayers.filter(id => id !== player.id));
      }
    } else {
      // Check if player price exceeds remaining budget
      if (player.price > remainingBudget) {
        setError("Budget insufficiente per questo giocatore");
        return;
      }
      
      // Check role constraints before adding
      if (player.position === "Portiere" && selectedGoalkeepers.length >= 1) {
        setError("Puoi selezionare solo 1 portiere");
        return;
      }
      
      if (player.position !== "Portiere" && selectedOutfieldPlayers.length >= 4) {
        setError("Puoi selezionare solo 4 giocatori di movimento");
        return;
      }
      
      // Add player
      setSelectedPlayers([...selectedPlayers, player.id]);
      
      // Update budget when adding a player
      setRemainingBudget(remainingBudget - player.price);
      
      if (player.position === "Portiere") {
        setSelectedGoalkeepers([...selectedGoalkeepers, player.id]);
      } else {
        setSelectedOutfieldPlayers([...selectedOutfieldPlayers, player.id]);
      }
    }
    
    // Clear error when selection changes
    setError('');
  };

  // In the handleSubmit function, make sure we're sending actual player IDs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!teamName.trim()) {
        setError('Inserisci un nome per la squadra');
        return;
      }
  
      // Check if we have selected any players
      if (selectedPlayers.length === 0) {
        setError('Seleziona almeno un giocatore');
        return;
      }
      
      // Log the selected players for debugging
      console.log('Selected players:', selectedPlayers);
      
      setLoading(true);
      
      // Make sure we're sending the actual player IDs, not just array indices
      const playerIds = selectedPlayers.filter(id => id !== null && id !== undefined);
      
      console.log('Player IDs to send:', playerIds);
      
      if (playerIds.length === 0) {
        setError('Nessun giocatore valido selezionato');
        setLoading(false);
        return;
      }
      
      const teamData = {
        name: teamName,
        playerIds: playerIds
      };
      
      await createTeam(teamData);
      setSuccess('Squadra creata con successo!');
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating team:', err);
      
      let errorMessage = 'Errore durante la creazione della squadra';
      if (err.response?.data?.message) {
        errorMessage = `Errore: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Get selected player objects for display
  const selectedPlayerObjects = players.filter(player => selectedPlayers.includes(player.id));

  return (
    <Container fluid>
      <h2 className="my-4">Crea la tua Squadra</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        {/* Main content - 9 columns */}
        <Col md={9}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome Squadra</Form.Label>
              <Form.Control 
                type="text" 
                value={teamName} 
                onChange={(e) => setTeamName(e.target.value)}
                required 
              />
            </Form.Group>
            
            <div className="mb-3">
              <h4>Seleziona i Giocatori</h4>
              <p>Seleziona esattamente 1 portiere e 4 giocatori di movimento</p>
              
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <strong>Portieri selezionati:</strong> {selectedGoalkeepers.length}/1
                </div>
                <div>
                  <strong>Giocatori di movimento selezionati:</strong> {selectedOutfieldPlayers.length}/4
                </div>
              </div>
              
              <Row>
                {players
                  .filter(player => !selectedPlayers.includes(player.id)) // Only show unselected players
                  .map(player => (
                    <Col key={player.id} md={4} className="mb-3">
                      <Card 
                        onClick={() => handlePlayerSelect(player)}
                        className="player-card"
                        style={{ 
                          cursor: 'pointer',
                          border: '1px solid #dee2e6'
                        }}
                      >
                        <Card.Body>
                          <Card.Title>{player.name}</Card.Title>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge bg={player.position === 'Portiere' ? 'warning' : 'info'}>
                              {player.position}
                            </Badge>
                            <span className="text-muted">{player.price}</span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </div>
            
            <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                // Rimuoviamo la condizione: || selectedPlayers.length !== 5
              >
                {loading ? 'Creazione...' : 'Crea Squadra'}
              </Button>
          </Form>
        </Col>
        
        {/* Sidebar - 3 columns */}
        <Col md={3}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Riepilogo Squadra</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Budget</h6>
                <div className="d-flex justify-content-between">
                  <span>Totale:</span>
                  <strong>{totalBudget}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Speso:</span>
                  <strong>{totalBudget - remainingBudget}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Rimanente:</span>
                  <strong className={remainingBudget < 50 ? 'text-danger' : ''}>
                    {remainingBudget}
                  </strong>
                </div>
              </div>
              
              <h6>Giocatori Selezionati ({selectedPlayerObjects.length}/5)</h6>
              {selectedPlayerObjects.length === 0 ? (
                <p className="text-muted">Nessun giocatore selezionato</p>
              ) : (
                <ListGroup variant="flush">
                  {selectedPlayerObjects.map(player => (
                    <ListGroup.Item 
                      key={player.id}
                      className="d-flex justify-content-between align-items-center"
                      action
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div>
                        <div>{player.name}</div>
                        <Badge bg={player.position === 'Portiere' ? 'warning' : 'info'}>
                          {player.position}
                        </Badge>
                      </div>
                      <span>{player.price}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeamCreate;