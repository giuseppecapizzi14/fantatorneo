import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrophy, FaUsers, FaFutbol, FaChartLine } from 'react-icons/fa';
import axios from 'axios';

const Home = () => {
  const [hasTeam, setHasTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
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
          
          // Get the user ID from the decoded token
          const userId = decoded.userId || decoded.id || decoded.sub;
          
          console.log('Checking teams for user ID:', userId); // Debug log
          
          if (!userId) {
            console.error('No user ID found in token');
            setHasTeam(false);
            setLoading(false);
            return;
          }
          
          // Make API call to check user's teams with the specific user ID
          const response = await axios.get(`/api/teams/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // If user has a team, response will have data
          setHasTeam(response.data && response.data.length > 0);
        } catch (error) {
          console.error('Error checking user team:', error);
          setHasTeam(false);
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
      },
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <FaChartLine size={40} />,
        description: 'Controlla i punteggi e le statistiche della tua squadra',
        requiresAuth: true
      }
    ];
    
    // Filter out "Crea la tua Squadra" if user already has a team
    return allFeatures.filter(feature => 
      !feature.showOnlyIfNoTeam || (feature.showOnlyIfNoTeam && !hasTeam)
    );
  };

  return (
    <Container>
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