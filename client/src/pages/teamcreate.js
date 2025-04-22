import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Badge, ListGroup, Offcanvas, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPlayers, createTeam } from '../services/api';
import { FaFutbol, FaShieldAlt, FaRunning, FaHandsHelping, FaSave, FaTimes, FaList, FaTrophy, FaSearch } from 'react-icons/fa';

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
  const [success, setSuccess] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); // Add the missing state variable
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

  // Filtra i giocatori in base alla posizione selezionata e al termine di ricerca
  const getFilteredPlayers = () => {
    let filteredByPosition;
    
    if (activeTab === 'all') {
      filteredByPosition = players.filter(player => !selectedPlayers.includes(player.id));
    } else if (activeTab === 'portieri') {
      filteredByPosition = players.filter(player => !selectedPlayers.includes(player.id) && player.position === 'Portiere');
    } else if (activeTab === 'difensori') {
      filteredByPosition = players.filter(player => !selectedPlayers.includes(player.id) && player.position === 'Difensore');
    } else if (activeTab === 'centrocampisti') {
      filteredByPosition = players.filter(player => !selectedPlayers.includes(player.id) && player.position === 'Centrocampista');
    } else if (activeTab === 'attaccanti') {
      filteredByPosition = players.filter(player => !selectedPlayers.includes(player.id) && player.position === 'Attaccante');
    } else {
      filteredByPosition = [];
    }
    
    // Filtra ulteriormente in base al termine di ricerca
    if (searchTerm.trim() === '') {
      return filteredByPosition;
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      return filteredByPosition.filter(player => 
        player.name.toLowerCase().includes(searchTermLower)
      );
    }
  };

  // Ottieni il colore del badge in base alla posizione
  const getBadgeColor = (position) => {
    switch (position) {
      case 'Portiere': return 'warning';
      case 'Difensore': return 'success';
      case 'Centrocampista': return 'info';
      case 'Attaccante': return 'danger';
      default: return 'secondary';
    }
  };

  // Ottieni l'icona in base alla posizione
  const getPositionIcon = (position) => {
    switch (position) {
      case 'Portiere': return <FaHandsHelping className="me-1" />;
      case 'Difensore': return <FaShieldAlt className="me-1" />;
      case 'Centrocampista': return <FaRunning className="me-1" />;
      case 'Attaccante': return <FaFutbol className="me-1" />;
      default: return null;
    }
  };

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
          .list-group-item.admin-card {
            padding: 0.5rem 1rem;
          }
          .custom-offcanvas .offcanvas-header,
          .custom-offcanvas .offcanvas-body {
            background-color: #343a40;
            color: white;
          }
          .custom-offcanvas .btn-close {
            filter: invert(1) grayscale(100%) brightness(200%);
          }
          .nav-tabs .nav-link {
            color: white;
            border-color: rgba(255, 208, 0, 0.3);
          }
          .nav-tabs .nav-link.active {
            background-color: rgba(255, 208, 0, 0.2);
            color: rgb(255, 208, 0);
            border-color: rgba(255, 208, 0, 0.5);
          }
        `}
      </style>
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="text-warning mb-3 mb-md-0">
          <FaTrophy className="me-2" />
          Crea la tua Squadra
        </h2>
        <Button 
          variant="outline-warning" 
          onClick={() => setShowSidebar(true)}
          className="d-md-none"
        >
          <FaList className="me-2" /> Visualizza Giocatori
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row>
        <Col md={8}>
          <Card className="admin-card mb-4">
            <Card.Header>
              <h5 className="text-warning mb-0">Dettagli Squadra</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} className="admin-form">
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Nome Squadra</Form.Label>
                  <Form.Control
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Inserisci il nome della tua squadra"
                    required
                    className="bg-dark text-white border-warning"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="text-white">
                    Budget: <span className="text-warning">{remainingBudget}</span> / {totalBudget} crediti
                  </div>
                  <div className="text-white">
                    Giocatori: <span className="text-warning">{selectedPlayers.length}</span> / 5
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-white mb-3">Giocatori Selezionati</h5>
                  {selectedPlayerObjects.length === 0 ? (
                    <p className="text-muted">Nessun giocatore selezionato</p>
                  ) : (
                    <ListGroup>
                      {selectedPlayerObjects.map(player => (
                        <ListGroup.Item key={player.id} className="admin-card border-warning mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <Badge bg={getBadgeColor(player.position)} className="me-2">
                                {getPositionIcon(player.position)} {player.position.charAt(0)}
                              </Badge>
                              <span className="text-white">{player.name}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <Badge bg="secondary" className="me-2">{player.price} cr</Badge>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handlePlayerSelect(player)}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
                
                <div className="d-grid">
                  <Button 
                    variant="warning" 
                    type="submit" 
                    disabled={loading || selectedPlayers.length === 0}
                    className="text-dark"
                  >
                    {loading ? 'Creazione in corso...' : 'Crea Squadra'} <FaSave className="ms-2" />
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="d-none d-md-block">
          <Card className="admin-card">
            <Card.Header>
              <h5 className="text-warning mb-0">Seleziona Giocatori</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="search-icon">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cerca giocatori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-warning" 
                      onClick={() => setSearchTerm('')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
              
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="all" title="Tutti">
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {getFilteredPlayers().map(player => (
                      <Card 
                        key={player.id} 
                        className="admin-card border-warning mb-2"
                        onClick={() => handlePlayerSelect(player)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="py-2 px-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <Badge bg={getBadgeColor(player.position)} className="me-2">
                                {getPositionIcon(player.position)} {player.position.charAt(0)}
                              </Badge>
                              <span className="text-white">{player.name}</span>
                            </div>
                            <Badge bg="warning" className="text-dark">{player.price} cr</Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Tab>
                <Tab eventKey="portieri" title="Portieri">
                  {/* Contenuto simile per i portieri */}
                </Tab>
                <Tab eventKey="difensori" title="Difensori">
                  {/* Contenuto simile per i difensori */}
                </Tab>
                <Tab eventKey="centrocampisti" title="Centrocampisti">
                  {/* Contenuto simile per i centrocampisti */}
                </Tab>
                <Tab eventKey="attaccanti" title="Attaccanti">
                  {/* Contenuto simile per gli attaccanti */}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Offcanvas per dispositivi mobili */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)} 
        placement="end"
        className="custom-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="text-warning">Seleziona Giocatori</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text className="search-icon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Cerca giocatori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <Button 
                  variant="outline-warning" 
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </Button>
              )}
            </InputGroup>
          </Form.Group>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="Tutti">
              {getFilteredPlayers().map(player => (
                <Card 
                  key={player.id} 
                  className="admin-card border-warning mb-2"
                  onClick={() => {
                    handlePlayerSelect(player);
                    if (selectedPlayers.includes(player.id)) {
                      setShowSidebar(false);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge bg={getBadgeColor(player.position)} className="me-2">
                          {getPositionIcon(player.position)} {player.position.charAt(0)}
                        </Badge>
                        <span className="text-white">{player.name}</span>
                      </div>
                      <Badge bg="warning" className="text-dark">{player.price} cr</Badge>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Tab>
            {/* Altri tab simili */}
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default TeamCreate;