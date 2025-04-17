import React, { useContext, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout, isAdmin, checkAuthStatus } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Check auth status when component mounts and when route changes
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus, window.location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Fantasy Football</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/teams">Squadre</Nav.Link>
                <Nav.Link as={Link} to="/players">Giocatori</Nav.Link>
                
                {/* Admin-only links */}
                {isAdmin && (
                  <>
                    <Nav.Link as={Link} to="/admin/players">Gestione Giocatori</Nav.Link>
                    <Nav.Link as={Link} to="/admin/matches">Gestione Partite</Nav.Link>
                    <Nav.Link as={Link} to="/admin/users">Gestione Utenti</Nav.Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrati</Nav.Link>
              </>
            )}
          </Nav>
          
          {user && (
            <Nav>
              <Navbar.Text className="me-3">
                Benvenuto, {user.username} {isAdmin && <span className="text-warning">(Admin)</span>}
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;