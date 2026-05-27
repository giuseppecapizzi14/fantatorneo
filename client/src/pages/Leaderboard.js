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
        <>
          <div className="d-none d-md-block">
            <Table responsive className="leaderboard-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Squadra</th>
                  <th>Proprietario</th>
                  <th className="text-center">Punti</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team.id}>
                    <td className="align-middle">
                      {getMedalIcon(index + 1)}
                    </td>
                    <td className="align-middle text-warning">{team.name}</td>
                    <td className="align-middle">{team.owner_username}</td>
                    <td className="align-middle text-center">
                      <span className="badge bg-warning text-dark px-3 py-2">
                        {team.total_points || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-md-none">
            {teams.map((team, index) => (
              <Card key={team.id} className="admin-card mb-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-warning">{getMedalIcon(index + 1)}</span>
                      <span className="fw-semibold text-warning">{team.name}</span>
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2">
                      {team.total_points || 0}
                    </span>
                  </div>
                  <div className="small text-white-50">{team.owner_username}</div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default Leaderboard;
