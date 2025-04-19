import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { getUserTeam } from '../services/api';
import { FaFutbol, FaTrophy } from 'react-icons/fa';

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
      <h2 className="mb-4 text-center">Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={8}>
          {team ? (
            <Card className="mb-4 admin-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <FaFutbol size={40} className="text-warning mb-2" />
                  <h3 className="text-warning">{team.name}</h3>
                  <p className="text-white">
                    <strong>Punteggio totale:</strong> <span className="text-warning">{team.total_points}</span> punti
                  </p>
                </div>
                
                <h5 className="mt-4 text-white">Giocatori:</h5>
                <ul className="list-group mb-4">
                  {team.players && team.players.map(player => (
                    <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center admin-card border-warning">
                      <div className="text-white">
                        <span className={player.is_goalkeeper ? 'badge bg-warning me-2' : 'badge bg-info me-2'}>
                          {player.is_goalkeeper ? 'P' : 'M'}
                        </span>
                        {player.name}
                      </div>
                      <span className="badge bg-warning rounded-pill">{player.total_points} pt</span>
                    </li>
                  ))}
                </ul>
                
                <div className="d-flex justify-content-center mt-3">
                  <Link to="/teams">
                    <Button variant="outline-warning" className="me-2">Vedi tutte le squadre</Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="warning">Vedi classifica</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-4 admin-card">
              <Card.Body className="text-center">
                <FaTrophy size={40} className="text-warning mb-3" />
                <h3 className="text-warning">Nessuna squadra</h3>
                <p className="text-white mb-4">
                  Non hai ancora creato una squadra. Crea la tua squadra per partecipare al fantacalcio!
                </p>
                <Link to="/create-team">
                  <Button variant="warning">Crea la tua Squadra</Button>
                </Link>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-4 admin-card">
            <Card.Body>
              <h5 className="text-warning text-center mb-3">Azioni rapide</h5>
              <div className="d-grid gap-2">
                <Link to="/leaderboard">
                  <Button variant="outline-warning" className="w-100 mb-2">Classifica</Button>
                </Link>
                
                <Link to="/teams">
                  <Button variant="outline-warning" className="w-100 mb-2">Tutte le Squadre</Button>
                </Link>
                
                {!team && (
                  <Link to="/create-team">
                    <Button variant="warning" className="w-100">Crea Squadra</Button>
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