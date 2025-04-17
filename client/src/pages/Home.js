import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mobile-container">
      <Row className="my-4 text-center">
        <Col>
          <h1>Benvenuto nell'App di Fantacalcio</h1>
          <p className="lead">
            Crea la tua squadra, competi con gli amici e scala la classifica!
          </p>
        </Col>
      </Row>
      
      <Row className="my-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 mobile-card">
            <Card.Body>
              <Card.Title>Crea la tua Squadra</Card.Title>
              <Card.Text>
                Seleziona 1 portiere e 4 giocatori di movimento con un budget di 250 crediti.
              </Card.Text>
              <Link to="/create-team">
                <Button variant="primary" className="mobile-btn">Crea Squadra</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100 mobile-card">
            <Card.Body>
              <Card.Title>Visualizza le Squadre</Card.Title>
              <Card.Text>
                Scopri le squadre degli altri partecipanti e le loro strategie.
              </Card.Text>
              <Link to="/teams">
                <Button variant="primary" className="mobile-btn">Vedi Squadre</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100 mobile-card">
            <Card.Body>
              <Card.Title>Classifica</Card.Title>
              <Card.Text>
                Controlla la classifica aggiornata e la posizione della tua squadra.
              </Card.Text>
              <Link to="/leaderboard">
                <Button variant="primary" className="mobile-btn">Vedi Classifica</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;