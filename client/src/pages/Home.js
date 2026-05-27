import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrophy, FaUsers, FaFutbol, FaChartLine,
   FaTimesCircle, FaHandPaper, FaExclamationTriangle, 
   FaBookOpen, FaRunning, FaHandsHelping, FaMedal, FaCrown, FaShieldAlt } from 'react-icons/fa';
import { getUserTeam } from '../services/api'; // Importa la funzione getUserTeam

const Home = () => {
  const [hasTeam, setHasTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user has a team
  useEffect(() => {
    const checkUserTeam = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // First, decode the token to get user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          
          // Modifica: Estrai l'ID utente in modo più robusto, controllando tutti i possibili campi
          const userId = decoded.user?.id || decoded.userId || decoded.id || decoded.user?.userId || decoded.sub;
          
          if (!userId) {
            setHasTeam(false);
            setLoading(false);
            return;
          }
          
          // Utilizza la funzione importata invece di fare una chiamata diretta
          const response = await getUserTeam(userId);
          
          // Se riceviamo una risposta valida, l'utente ha una squadra
          if (response.data) {
            setHasTeam(true);
          } else {
            setHasTeam(false);
          }
          
        } catch (error) {
          console.error('Error checking user team:', error);
          
          // Se l'errore è 404 Not Found, significa che l'utente non ha una squadra
          if (error.response && error.response.status === 404) {
            setHasTeam(false);
          } else {
            // Per altri errori, assumiamo che non ci sia una squadra
            setHasTeam(false);
          }
        }
      } else {
        setHasTeam(false);
      }
      
      setLoading(false);
    };
    
    checkUserTeam();
  }, []);
  
  // Array of main features
  const getFeatures = () => {
    const allFeatures = [
      {
        title: 'Crea la tua Squadra',
        path: '/create-team',
        icon: <FaFutbol size={40} />,
        description: 'Seleziona i migliori giocatori e crea la tua squadra da sogno',
        requiresAuth: true,
        showOnlyIfNoTeam: true
      },

      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <FaChartLine size={40} />,
        description: 'Controlla i punteggi e le statistiche della tua squadra',
        requiresAuth: true
      },

      {
        title: 'Classifica',
        path: '/leaderboard',
        icon: <FaTrophy size={40} />,
        description: 'Scopri chi è in testa alla classifica del torneo',
        requiresAuth: true
      },

      {
        title: 'Tutte le Squadre',
        path: '/teams',
        icon: <FaUsers size={40} />,
        description: 'Esplora le squadre create dagli altri partecipanti',
        requiresAuth: true
      }
    ];
    
    // Filter out "Crea la tua Squadra" if user already has a team
    const filteredFeatures = allFeatures.filter(feature => {
      const shouldShow = !feature.showOnlyIfNoTeam || (feature.showOnlyIfNoTeam && !hasTeam);
      return shouldShow;
    });
    
    return filteredFeatures;
  };

  return (
    <Container>
      <div className="text-center mb-5">
        <h1 className="mb-3 app-title">Benvenuto al FANTATORNEO</h1>
      </div>
      
      {loading ? (
        <div className="text-center">
          <p>Caricamento...</p>
        </div>
      ) : (
        <Row className="justify-content-center">
          {getFeatures().map((feature, index) => (
            <Col key={index} md={6} lg={3} className="mb-4">
              <Link to={feature.path} className="text-decoration-none">
                <Card className="h-100 text-center admin-card">
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                    <div className="icon-container mb-3 text-warning">
                      {feature.icon}
                    </div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="app-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
      
      <Row className="justify-content-center">
        <Col md={10} lg={8} className="mb-4">
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
                      <span>Gol segnato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaHandsHelping className="text-info me-2" />
                      <span>Assist: </span>
                      <span className="text-success fw-bold">+1</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-success me-2" />
                      <span>Tiro libero segnato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span>Tiro libero sbagliato: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span>Rigore sbagliato: </span>
                      <span className="text-danger fw-bold">-3</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-success me-2" />
                      <span>Rigore segnato: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaExclamationTriangle className="text-warning me-2" />
                      <span>Ammonizione: </span>
                      <span className="text-danger fw-bold">-1</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span>Espulsione: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaMedal className="text-warning me-2" />
                      <span>MVP: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio ai quarti: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio in semifinale: </span>
                      <span className="text-success fw-bold">+5</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio in finale: </span>
                      <span className="text-success fw-bold">+7</span>
                    </div>
                    <div className="mb-2">
                      <FaCrown className="text-warning me-2" />
                      <span>Vincente in finale: </span>
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
                      <span>Porta imbattuta: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaFutbol className="text-danger me-2" />
                      <span>Gol subito: </span>
                      <span className="text-danger fw-bold">-0.5</span>
                    </div>
                    <div className="mb-2">
                      <FaHandPaper className="text-success me-2" />
                      <span>Rigore parato: </span>
                      <span className="text-success fw-bold">+3</span>
                    </div>
                    <div className="mb-2">
                      <FaHandPaper className="text-success me-2" />
                      <span>Tiro libero parato: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaExclamationTriangle className="text-warning me-2" />
                      <span>Ammonizione: </span>
                      <span className="text-danger fw-bold">-1</span>
                    </div>
                    <div className="mb-2">
                      <FaTimesCircle className="text-danger me-2" />
                      <span>Espulsione: </span>
                      <span className="text-danger fw-bold">-2</span>
                    </div>
                    <div className="mb-2">
                      <FaMedal className="text-warning me-2" />
                      <span>MVP: </span>
                      <span className="text-success fw-bold">+2</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio ai quarti: </span>
                      <span className="text-success fw-bold">+5</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio in semifinale: </span>
                      <span className="text-success fw-bold">+10</span>
                    </div>
                    <div className="mb-2">
                      <FaTrophy className="text-warning me-2" />
                      <span>Passaggio in finale: </span>
                      <span className="text-success fw-bold">+15</span>
                    </div>
                    <div className="mb-2">
                      <FaCrown className="text-warning me-2" />
                      <span>Vincente finale: </span>
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

export default Home;
