import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Badge } from 'react-bootstrap';
import { getTeams, deleteTeam } from '../../services/api';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      setTeams(res.data);
    } catch (err) {
      setError('Errore nel caricamento delle squadre');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (teamId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa squadra?')) {
      try {
        await deleteTeam(teamId);
        fetchTeams();
      } catch (err) {
        setError('Errore durante l\'eliminazione della squadra');
      }
    }
  };

  if (loading && teams.length === 0) {
    return (
      <Container className="text-center my-5">
        <h3>Caricamento squadre...</h3>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Gestione Squadre</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome Squadra</th>
            <th>Proprietario</th>
            <th>Punti</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.id}</td>
              <td>{team.name}</td>
              <td>{team.owner_username}</td>
              <td>
                <Badge bg="primary">{team.total_points}</Badge>
              </td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(team.id)}
                >
                  Elimina
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminTeams;