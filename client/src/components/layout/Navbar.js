import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';

const Navbar = ({ isAuthenticated, user, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Fantacalcio App</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/teams">Squadre</Nav.Link>
                <Nav.Link as={Link} to="/leaderboard">Classifica</Nav.Link>
                {user?.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
                    <Nav.Link as={Link} to="/register">Registra Utente</Nav.Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </>
            )}
          </Nav>
          {isAuthenticated && (
            <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;