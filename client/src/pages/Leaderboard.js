import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard();
        setLeaderboard(res.data);
      } catch (err) {
        setError('Errore nel caricamento della classifica');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <h3>Caricamento classifica...</h3>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Classifica</h1>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th>Squadra</th>
                <th>Proprietario</th>
                <th className="text-center">Punti</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, index) => (
                <tr key={team.id}>
                  <td className="text-center">
                    {index === 0 ? (
                      <Badge bg="warning" text="dark">1</Badge>
                    ) : index === 1 ? (
                      <Badge bg="secondary">2</Badge>
                    ) : index === 2 ? (
                      <Badge bg="danger">3</Badge>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td>{team.name}</td>
                  <td>{team.owner_username}</td>
                  <td className="text-center">{team.total_points}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default Leaderboard;