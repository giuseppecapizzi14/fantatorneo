import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFutbol } from 'react-icons/fa';

const Landing = () => {
  return (
    <Container className="text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="mb-4">
        <FaFutbol size={80} className="text-warning mb-4" />
        <h1 className="display-4 mb-3">Benvenuto al FANTATORNEO</h1>
        <p className="lead mb-5">
          Crea la tua squadra, seleziona i migliori giocatori e competi con i tuoi amici.
        </p>
      </div>
      
      <Link to="/login">
        <Button 
          variant="warning" 
          size="lg" 
          className="px-5 py-3 rounded-pill shadow-lg"
        >
          Accedi per Giocare
        </Button>
      </Link>
    </Container>
  );
};

export default Landing;