import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const AdminPanel = () => {
  return (
    <Container>
      <h2 className="mb-4">Pannello Amministratore</h2>
      
      <Row>
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Gestione Utenti</Card.Title>
              <Card.Text>
                Gestisci gli utenti registrati, modifica i loro dati o elimina account.
              </Card.Text>
              <div className="mt-auto">
                <Link to="/admin/users">
                  <Button variant="primary" className="w-100">Gestisci Utenti</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Gestione Squadre</Card.Title>
              <Card.Text>
                Visualizza, modifica o elimina le squadre create dagli utenti.
              </Card.Text>
              <div className="mt-auto">
                <Link to="/admin/teams">
                  <Button variant="primary" className="w-100">Gestisci Squadre</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Gestione Giocatori</Card.Title>
              <Card.Text>
                Aggiungi, modifica o elimina i giocatori disponibili per le squadre.
              </Card.Text>
              <div className="mt-auto">
                <Link to="/admin/players">
                  <Button variant="primary" className="w-100">Gestisci Giocatori</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Gestione Bonus</Card.Title>
              <Card.Text>
                Assegna bonus ai giocatori per ogni giornata e aggiorna la classifica.
              </Card.Text>
              <div className="mt-auto">
                <Link to="/admin/bonus">
                  <Button variant="primary" className="w-100">Gestisci Bonus</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;