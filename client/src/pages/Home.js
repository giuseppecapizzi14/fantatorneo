import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrophy, FaUsers, FaFutbol, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { getUserTeam } from '../services/api'; // Importa la funzione getUserTeam

const Home = () => {
  const [hasTeam, setHasTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user has a team
  useEffect(() => {
    const checkUserTeam = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsAuthenticated(true);
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
          
          console.log('Decoded token:', decoded); // Log completo del token decodificato
          console.log('Checking teams for user ID:', userId); // Debug log
          
          if (!userId) {
            console.error('No user ID found in token');
            setHasTeam(false);
            setLoading(false);
            return;
          }
          
          // Utilizza la funzione importata invece di fare una chiamata diretta
          const response = await getUserTeam(userId);
          
          console.log('Team API response:', response);
          
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
        setIsAuthenticated(false);
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
      console.log(`Feature "${feature.title}" - showOnlyIfNoTeam: ${feature.showOnlyIfNoTeam}, hasTeam: ${hasTeam}, shouldShow: ${shouldShow}`);
      return shouldShow;
    });
    
    return filteredFeatures;
  };

  return (
    <Container>
      {console.log('Rendering with hasTeam:', hasTeam)}
      <div className="text-center mb-5">
        <h1 className="mb-3">Benvenuto al FANTATORNEO</h1>
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
                    <Card.Text className="text-white">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
      
      <div className="mt-5 p-4 text-center rounded admin-card">
        <h3 className="text-warning mb-3">Come Funziona</h3>
        <p>
          Il Fantatorneo è un gioco basato sulle prestazioni reali dei giocatori durante il torneo.
          Crea la tua squadra, seleziona i giocatori e guadagna punti in base alle loro prestazioni nelle partite.
          Competi con gli altri partecipanti e scala la classifica!
        </p>
      </div>
    </Container>
  );
};

export default Home;