import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaFutbol, FaTrophy, FaStar } from 'react-icons/fa';

const AdminPanel = () => {
  // Array of admin options
  const adminOptions = [
    {
      title: 'Gestione Utenti',
      path: '/admin/users',
      icon: <FaUsers size={40} />,
      description: 'Gestisci gli utenti della piattaforma'
    },
    
    {
      title: 'Gestione Squadre',
      path: '/admin/teams',
      icon: <FaTrophy size={40} />,
      description: 'Gestisci le squadre del torneo'
    },

    {
      title: 'Gestione Bonus',
      path: '/admin/bonus',
      icon: <FaStar size={40} />,
      description: 'Gestisci i bonus e i punteggi'
    },
  ];

  return (
    <Container>
      <h1 className="mb-4 text-center">Pannello Amministratore</h1>
      <p className="text-center mb-5">Seleziona un'opzione per gestire la piattaforma</p>
      
      <Row className="justify-content-center">
        {adminOptions.map((option, index) => (
          <Col key={index} md={6} lg={3} className="mb-4">
            <Link to={option.path} className="text-decoration-none">
              <Card className="h-100 text-center admin-card">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <div className="icon-container mb-3 text-warning">
                    {option.icon}
                  </div>
                  <Card.Title>{option.title}</Card.Title>
                  <Card.Text className="text-white">
                    {option.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminPanel;