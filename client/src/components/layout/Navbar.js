import React, { useState } from 'react';
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

  const handleTitleClick = () => {
    closeNavbar();
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const closeNavbar = () => setExpanded(false);
  
  return (
    <BootstrapNavbar 
      expand="lg" 
      expanded={expanded} 
      className="mb-4 custom-navbar sticky-top"
    >
      <Container>
        <BootstrapNavbar.Brand 
          onClick={handleTitleClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            width="28"
            height="28"
            className="d-inline-block align-top me-2"
            alt="Fantatorneo"
          />
          <span>FANTATORNEO</span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
          className="custom-toggler"
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto desktop-nav">
            {/* Link sempre visibile per Calendario e Risultati */}
            <Nav.Link 
              as={Link} 
              to="/calendar" 
              onClick={closeNavbar}
              className="text-uppercase nav-item"
            >
              Calendario & Risultati
            </Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  onClick={closeNavbar}
                  className="text-uppercase nav-item"
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/teams" 
                  onClick={closeNavbar}
                  className="text-uppercase nav-item"
                >
                  Squadre
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/leaderboard" 
                  onClick={closeNavbar}
                  className="text-uppercase nav-item"
                >
                  Classifica
                </Nav.Link>
                
                {user && user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    onClick={closeNavbar}
                    className="text-uppercase nav-item"
                  >
                    Admin
                  </Nav.Link>
                )}
                
                <Button 
                  variant="outline-light"
                  onClick={() => {handleLogout(); closeNavbar();}}
                  className="nav-item logout-btn"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  onClick={closeNavbar}
                  className="text-uppercase nav-item"
                >
                  Home
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  onClick={closeNavbar}
                  className="text-uppercase nav-item"
                >
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default NavbarComponent;
