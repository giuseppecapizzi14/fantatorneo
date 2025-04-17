import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { getUserTeam } from '../services/api';

const Dashboard = ({ user }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const res = await getUserTeam(user.id);
        setTeam(res.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Errore nel caricamento della squadra');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserTeam();
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <h3>Caricamento...</h3>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={8}>
          {team ? (
            <Card className="mb-4">
              <Card.Header as="h5">La tua squadra: {team.name}</Card.Header>
              <Card.Body>
                <Card.Text>
                  <strong>Punteggio totale:</strong> {team.total_points} punti
                </Card.Text>
                
                <h5 className="mt-4">Giocatori:</h5>
                <ul className="list-group mb-4">
                  {team.players && team.players.map(player => (
                    <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className={player.is_goalkeeper ? 'badge bg-warning me-2' : 'badge bg-info me-2'}>
                          {player.is_goalkeeper ? 'P' : player.position}
                        </span>
                        {player.name}
                      </div>
                      <span className="badge bg-primary rounded-pill">{player.total_points} pt</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/teams">
                  <Button variant="outline-primary" className="me-2">Vedi tutte le squadre</Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline-success">Vedi classifica</Button>
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-4">
              <Card.Header as="h5">Nessuna squadra</Card.Header>
              <Card.Body>
                <Card.Text>
                  Non hai ancora creato una squadra. Crea la tua squadra per partecipare al fantacalcio!
                </Card.Text>
                <Link to="/create-team">
                  <Button variant="primary">Crea la tua Squadra</Button>
                </Link>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header as="h5">Azioni rapide</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="danger" className="w-100 mb-2">Pannello Admin</Button>
                  </Link>
                )}
                
                <Link to="/leaderboard">
                  <Button variant="success" className="w-100 mb-2">Classifica</Button>
                </Link>
                
                <Link to="/teams">
                  <Button variant="info" className="w-100 mb-2">Tutte le Squadre</Button>
                </Link>
                
                {!team && (
                  <Link to="/create-team">
                    <Button variant="primary" className="w-100">Crea Squadra</Button>
                  </Link>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;