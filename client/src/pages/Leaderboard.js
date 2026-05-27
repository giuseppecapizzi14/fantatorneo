import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { FaTrophy, FaMedal, FaUsers } from 'react-icons/fa';
import api from '../services/api';

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setTeams(response.data);
      } catch (err) {
        setError('Errore nel caricamento della classifica');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to get medal icon based on position
  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <FaTrophy className="text-warning" />;
      case 2:
        return <FaMedal className="text-secondary" />;
      case 3:
        return <FaMedal style={{ color: '#CD7F32' }} />;
      default:
        return position;
    }
  };

  if (loading) {
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
      <h2 className="mb-4 text-center text-warning">
        <FaUsers className="me-2" />
        Classifica
      </h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {teams.length === 0 ? (
        <Alert variant="info">Nessuna squadra in classifica</Alert>
      ) : (
        <Card className="admin-card leaderboard-card">
          <Card.Body className="leaderboard-card-body">
            <div className="table-responsive leaderboard-table-wrap">
              <Table className="leaderboard-table mb-0">
                <thead>
                  <tr>
                    <th className="leaderboard-col-rank"></th>
                    <th className="leaderboard-col-team text-center">Squadra</th>
                    <th className="leaderboard-col-points text-center">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.id} className={index < 3 ? `leaderboard-row leaderboard-row--${index + 1}` : 'leaderboard-row'}>
                      <td className="leaderboard-col-rank">
                        <span className="leaderboard-rank">{getMedalIcon(index + 1)}</span>
                      </td>
                      <td>
                        <div className="leaderboard-team-cell">
                          <div className="leaderboard-team-name text-warning">{team.name}</div>
                          <div className="leaderboard-owner app-dim">{team.owner_username}</div>
                        </div>
                      </td>
                      <td className="leaderboard-col-points text-center">
                        <span className="badge bg-warning text-dark app-badge">
                          {team.total_points || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Leaderboard;
