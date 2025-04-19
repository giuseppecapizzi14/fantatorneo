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

  const closeNavbar = () => setExpanded(false);
  
  return (
    <BootstrapNavbar 
      expand="lg" 
      expanded={expanded} 
      className="mb-4 custom-navbar"
      style={{
        backgroundColor: 'rgba(33, 37, 41, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: 'none'
      }}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/home" onClick={closeNavbar}>
          <img
            src="/soccer-player.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Soccer player"
          />
          <span style={{ color: 'rgb(255, 208, 0)' }}>FANTATORNEO</span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
          className="custom-toggler"
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  onClick={closeNavbar}
                  className="text-white text-uppercase d-flex align-items-center"
                  style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/teams" 
                  onClick={closeNavbar}
                  className="text-white text-uppercase d-flex align-items-center"
                  style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  Squadre
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/leaderboard" 
                  onClick={closeNavbar}
                  className="text-white text-uppercase d-flex align-items-center"
                  style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  Classifica
                </Nav.Link>
                
                {user && user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    onClick={closeNavbar}
                    className="text-white text-uppercase me-3 d-flex align-items-center"
                    style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    Pannello Admin
                  </Nav.Link>
                )}
                
                <Button 
                  variant="outline-light" 
                  onClick={() => {handleLogout(); closeNavbar();}}
                  className="ms-2 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: 'rgba(220, 53, 69, 0.3)',
                    borderRadius: '50px',
                    padding: '0.25rem 0.75rem',
                    height: '38px'  // Match the height of Nav.Link elements
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  onClick={closeNavbar}
                  className="text-white text-uppercase d-flex align-items-center"
                  style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
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