import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaFutbol, 
  FaCalendarAlt, 
  FaBookOpen, 
  FaRunning, 
  FaHandsHelping, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaTrophy, 
  FaMedal, 
  FaCrown,
  FaShieldAlt,
  FaHandPaper
} from 'react-icons/fa';

const Landing = () => {
  return (
    <Container className="text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="mb-3">
        <FaFutbol size={80} className="text-warning mb-4" />
        <h1 className="display-4 mb-3">Benvenuto al FANTATORNEO</h1>
        <p className="lead mb-3">
          Crea la tua squadra, seleziona i migliori giocatori e competi con i tuoi amici.
        </p>
      </div>
      
      <Link to="/login">
        <Button 
          variant="warning" 
          size="lg" 
          className="px-5 py-3 rounded-pill shadow-lg mb-5"
        >
          Accedi per Giocare
        </Button>
      </Link>
      
      <Row className="justify-content-center mb-4">
        <Col md={6} lg={4} className="mb-4">
          <Link to="/calendar" className="text-decoration-none">
            <Card className="h-100 text-center admin-card">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="icon-container mb-3 text-warning">
                  <FaCalendarAlt size={40} />
                </div>
                <Card.Title>Calendario e Risultati</Card.Title>
                <Card.Text className="text-white">
                  Consulta il calendario delle partite e i risultati del torneo
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={8} className="mb-4">
          <Card className="h-100 text-center admin-card">
            <Card.Body>
              <div className="icon-container mb-3 text-warning mx-auto" style={{ width: '80px', height: '80px' }}>
                <FaBookOpen size={40} />
              </div>
              <Card.Title className="mb-4">Regolamento Punteggi</Card.Title>
              
              <Row>
                <Col md={6}>
                  <h5 className="text-warning mb-3">
                    <FaRunning className="me-2" />
                    GIOCATORE DI MOVIMENTO
                  </h5>
                  <div className="text-start">
                    <div className="mb-2">
                      <FaFutbol className="text-success me-2" />
                      <span className="text-white">Gol segnato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaHandsHelping className="text-info me-2" />
                      <span className="text-white">Assist: </span>
                      <span className="text-success fw-bold">+1</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-success me-2" />
                      <span className="text-white">Tiro libero segnato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span className="text-white">Tiro libero sbagliato: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span className="text-white">Rigore sbagliato: </span>
                      <span className="text-danger fw-bold">-3</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-success me-2" />
                      <span className="text-white">Rigore segnato: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaExclamationTriangle className="text-warning me-2" />
                      <span className="text-white">Ammonizione: </span>
                      <span className="text-danger fw-bold">-1</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span className="text-white">Espulsione: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaMedal className="text-warning me-2" />
                      <span className="text-white">MVP: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio ai quarti: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio in semifinale: </span>
                      <span className="text-success fw-bold">+5</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio in finale: </span>
                      <span className="text-success fw-bold">+7</span>
                    </div>
                    <div className="mb-2">
                      <FaCrown className="text-warning me-2" />
                      <span className="text-white">Vincente in finale: </span>
                      <span className="text-success fw-bold">+10</span>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <h5 className="text-warning mb-3">
                    <FaShieldAlt className="me-2" />
                    PORTIERE
                  </h5>
                  <div className="text-start">
                    <div className="mb-2">
                      <FaShieldAlt className="text-success me-2" />
                      <span className="text-white">Porta imbattuta: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-danger me-2" />
                      <span className="text-white">Gol subito: </span>
                      <span className="text-danger fw-bold">-0.5</span>
                    </div>
                    <div className="mb-2">
                      <FaHandPaper className="text-success me-2" />
                      <span className="text-white">Rigore parato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaHandPaper className="text-success me-2" />
                      <span className="text-white">Tiro libero parato: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaExclamationTriangle className="text-warning me-2" />
                      <span className="text-white">Ammonizione: </span>
                      <span className="text-danger fw-bold">-1</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span className="text-white">Espulsione: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaMedal className="text-warning me-2" />
                      <span className="text-white">MVP: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio ai quarti: </span>
                      <span className="text-success fw-bold">+5</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio in semifinale: </span>
                      <span className="text-success fw-bold">+10</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span className="text-white">Passaggio in finale: </span>
                      <span className="text-success fw-bold">+15</span>
                    </div>
                    <div className="mb-2">
                      <FaCrown className="text-warning me-2" />
                      <span className="text-white">Vincente finale: </span>
                      <span className="text-success fw-bold">+20</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Landing;