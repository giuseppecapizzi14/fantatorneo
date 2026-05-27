import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FaUsers, FaTrophy } from 'react-icons/fa';
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
        
        // Fetch details for each team
        const teamsWithDetails = await Promise.all(
          res.data.map(async (team) => {
            try {
              const details = await getTeamDetails(team.id);
              return details;
            } catch (err) {
              return team; // Return basic team info if details fetch fails
            }
          })
        );
        
        setTeams(teamsWithDetails);
      } catch (err) {
        setError('Errore nel caricamento delle squadre');
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
    if (!team.players) {
      return <p className="app-muted mb-0">Nessun giocatore nella squadra</p>;
    }
    
    if (team.players.length === 0) {
      return <p className="app-muted mb-0">Nessun giocatore nella squadra</p>;
    }
    
    return (
      <ListGroup variant="flush">
        {team.players.map(player => {
          return (
            <ListGroup.Item key={player.id} className="app-list-item">
              <div className="app-player-row">
                <div className="app-player-left">
                  <Badge bg={player.is_goalkeeper ? 'warning' : 'info'} className={player.is_goalkeeper ? 'text-dark app-badge' : 'app-badge'}>
                    {player.is_goalkeeper ? 'P' : player.position?.charAt(0) || 'G'}
                  </Badge>
                  <span className="app-player-name">{player.name}</span>
                </div>
                <div className="app-player-badges">
                  <Badge bg="secondary" className="app-badge">{player.price} cr</Badge>
                  <Badge bg="warning" className="text-dark app-badge">{player.total_points || 0} pt</Badge>
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
      <Container className="text-center text-white my-5">
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4 text-center text-warning app-title">
        <FaUsers className="me-2" />
        Tutte le Squadre
      </h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {teams.length === 0 ? (
        <Alert variant="info">Nessuna squadra trovata</Alert>
      ) : (
        <Row>
          {teams.map(team => (
            <Col key={team.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 admin-card app-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-warning app-card-header-title">{team.name}</h5>
                  <Badge bg="warning" className="text-dark app-badge">{team.total_points || 0} pt</Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Subtitle className="mb-3 app-muted">
                    <FaTrophy className="text-warning me-2" />
                    Proprietario: <span className="text-warning">{team.owner_username}</span>
                  </Card.Subtitle>
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
