import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { getTeams } from '../services/api';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Prima otteniamo l'elenco di tutte le squadre
        const res = await getTeams();
        console.log('Teams data:', res.data);
        
        // Fetch details for each team
        const teamsWithDetails = await Promise.all(
          res.data.map(async (team) => {
            try {
              const details = await getTeamDetails(team.id);
              console.log(`Team ${team.id} details:`, details);
              return details;
            } catch (err) {
              console.error(`Error fetching details for team ${team.id}:`, err);
              return team; // Return basic team info if details fetch fails
            }
          })
        );
        
        setTeams(teamsWithDetails);
      } catch (err) {
        setError('Errore nel caricamento delle squadre');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getTeamDetails = async (teamId) => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      
      // Assicuriamoci che i dati abbiano la struttura corretta
      const teamData = response.data;
      
      // Se i giocatori non sono presenti, inizializziamo un array vuoto
      if (!teamData.players) {
        teamData.players = [];
        console.warn(`Team ${teamId} has no players array, initializing empty array`);
      }
      
      return teamData;
    } catch (err) {
      console.error('Errore nel caricamento dei dettagli della squadra', err);
      throw err;
    }
  };

  // Funzione di debug per visualizzare la struttura dei dati
  const renderPlayersList = (team) => {
    console.log('Rendering players for team:', team);
    
    if (!team.players) {
      console.log('No players array found for team:', team.id);
      return <p className="text-muted">Nessun giocatore nella squadra (players array missing)</p>;
    }
    
    if (team.players.length === 0) {
      return <p className="text-muted">Nessun giocatore nella squadra (empty array)</p>;
    }
    
    return (
      <ListGroup variant="flush">
        {team.players.map(player => {
          console.log('Player data:', player);
          return (
            <ListGroup.Item key={player.id} className="px-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Badge bg={player.is_goalkeeper ? 'warning' : 'info'} className="me-2">
                    {player.is_goalkeeper ? 'P' : player.position?.charAt(0) || 'G'}
                  </Badge>
                  {player.name}
                </div>
                <div>
                  <Badge bg="secondary" className="me-2">{player.price} cr</Badge>
                  <Badge bg="success">{player.total_points || 0} pt</Badge>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="my-4">Tutte le Squadre</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {teams.length === 0 ? (
        <Alert variant="info">Nessuna squadra trovata</Alert>
      ) : (
        <Row>
          {teams.map(team => (
            <Col key={team.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{team.name}</h5>
                  <Badge bg="primary">{team.total_points || 0} pt</Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Subtitle className="mb-3 text-muted">
                    Proprietario: {team.owner_username}
                  </Card.Subtitle>
                  
                  <h6>Giocatori:</h6>
                  {renderPlayersList(team)}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TeamsList;