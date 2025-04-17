import React, { useContext, useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const NavbarComponent = ({ isAuthenticated, user, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const closeNavbar = () => setExpanded(false);
  
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" expanded={expanded} className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" onClick={closeNavbar}>Fantamazzarino</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")} 
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard" onClick={closeNavbar}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/teams" onClick={closeNavbar}>Squadre</Nav.Link>
                <Nav.Link as={Link} to="/leaderboard" onClick={closeNavbar}>Classifica</Nav.Link>
                {user && user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" onClick={closeNavbar}>Admin</Nav.Link>
                )}
                <Button variant="outline-light" onClick={() => {handleLogout(); closeNavbar();}}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={closeNavbar}>Login</Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={closeNavbar}>Registrati</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default NavbarComponent;