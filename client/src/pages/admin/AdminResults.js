import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaClipboardList, FaEdit, FaSave, FaTimes, FaFutbol } from 'react-icons/fa';
import { getCalendarMatches } from '../../services/api';
import api from '../../services/api';

const AdminResults = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [formData, setFormData] = useState({
    home_score: '',
    away_score: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await getCalendarMatches();
      setMatches(response.data);
    } catch (err) {
      setError('Errore nel caricamento delle partite');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (match) => {
    setCurrentMatch(match);
    setFormData({
      home_score: match.home_score || '',
      away_score: match.away_score || ''
    });
    setShowEditModal(true);
  };

  const handleSaveResult = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.put(`/calendar/matches/${currentMatch.id}`, {
        ...currentMatch,
        home_score: formData.home_score === '' ? null : parseInt(formData.home_score),
        away_score: formData.away_score === '' ? null : parseInt(formData.away_score)
      });
      
      // Update the matches list
      setMatches(matches.map(match => 
        match.id === currentMatch.id ? response.data : match
      ));
      
      setSuccess('Risultato aggiornato con successo!');
      setShowEditModal(false);
      setCurrentMatch(null);
    } catch (err) {
      setError('Errore nell\'aggiornamento del risultato');
      console.error('Error updating match result:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data da definire';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Orario da definire';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = (match) => {
    if (match.home_score !== null && match.away_score !== null) {
      return 'Terminata';
    }
    const now = new Date();
    const matchDate = new Date(match.match_date);
    return matchDate > now ? 'Programmata' : 'In corso';
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Terminata': return 'success';
      case 'In corso': return 'warning';
      default: return 'secondary';
    }
  };

  const getTeamLogo = (teamName) => {
    return `/logos/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
  };

  const TeamDisplay = ({ teamName, isHome = true }) => {
    const logoSrc = getTeamLogo(teamName);
    
    return (
      <div className="d-flex align-items-center" style={{ 
        minWidth: '120px',
        justifyContent: isHome ? 'flex-end' : 'flex-start'
      }}>
        {isHome ? (
          <>
            <img 
              src={logoSrc} 
              alt={`${teamName} logo`}
              style={{
                width: '20px',
                height: '20px',
                marginRight: '6px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>{teamName}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>{teamName}</span>
            <img 
              src={logoSrc} 
              alt={`${teamName} logo`}
              style={{
                width: '20px',
                height: '20px',
                marginLeft: '6px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">Caricamento partite...</p>
      </Container>
    );
  }

  return (
    <Container>
      <style>
        {`
          .custom-placeholder::placeholder {
            color: rgba(173, 181, 189, 0.7) !important;
          }
          .result-modal .modal-dialog {
            max-width: 400px;
            margin: auto;
            display: flex;
            align-items: center;
            min-height: calc(100vh - 1rem);
          }
          .result-modal .modal-content {
            width: 100%;
          }
          .result-modal .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
          }
          .result-modal .admin-card {
            transition: none !important;
            background-color: rgba(33, 37, 41, 0.9) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: 1px solid #ffc107 !important;
            box-shadow: 0 8px 32px 0 rgba(255, 193, 7, 0.3) !important;
          }
          .result-modal .admin-card:hover {
            transform: none !important;
            box-shadow: 0 8px 32px 0 rgba(255, 193, 7, 0.3) !important;
          }
        `}
      </style>
      
      <div className="d-flex align-items-center justify-content-center mb-5">
        <FaClipboardList className="me-2" size={24} style={{ color: 'rgb(255, 208, 0)' }} />
        <h3 className="mb-0" style={{ 
          color: 'rgb(255, 208, 0)', 
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontWeight: '600'
        }}>
          GESTIONE RISULTATI
        </h3>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {matches.map((match) => {
          const status = getMatchStatus(match);
          return (
            <Col key={match.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 admin-card">
                <Card.Body>
                  <div className="text-center mb-3">
                    <small style={{ color: 'white' }}>
                      {formatDate(match.match_date)} - {formatTime(match.match_date)}
                    </small>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <TeamDisplay teamName={match.home_team} isHome={true} />
                    <div className="text-center mx-3">
                      {match.home_score !== null && match.away_score !== null ? (
                        <span className="h4" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                          {match.home_score} - {match.away_score}
                        </span>
                      ) : (
                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>VS</span>
                      )}
                    </div>
                    <TeamDisplay teamName={match.away_team} isHome={false} />
                  </div>
                  
                  <div className="text-center mb-3">
                    <span className={`badge bg-${getStatusBadgeVariant(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  {match.venue && (
                    <div className="text-center mb-3">
                      <small className="text-muted">📍 {match.venue}</small>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => handleEditClick(match)}
                    >
                      <FaEdit className="me-1" />
                      {status === 'Terminata' ? 'Modifica Risultato' : 'Inserisci Risultato'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal per inserire/modificare risultato - Stile Login con sfondo blur */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="result-modal">
        <Modal.Body className="p-0">
          <div className="admin-card p-4 rounded" style={{ margin: 0 }}>
            <div className="text-center mb-4">
              <FaFutbol size={40} className="text-warning mb-3" />
              <h4 className="text-warning">Inserisci Risultato</h4>
            </div>
            
            {currentMatch && (
              <>
                {/* Header con squadre e loghi */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3" style={{
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  <TeamDisplay teamName={currentMatch.home_team} isHome={true} />
                  <div className="text-center mx-3">
                    <span style={{ color: '#ffc107', fontWeight: 'bold', fontSize: '1.2rem' }}>VS</span>
                  </div>
                  <TeamDisplay teamName={currentMatch.away_team} isHome={false} />
                </div>
                
                <div className="text-center mb-4">
                  <small style={{ color: 'white' }}>
                    {formatDate(currentMatch.match_date)} - {formatTime(currentMatch.match_date)}
                  </small>
                </div>
                
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white">{currentMatch.home_team}</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark border-warning text-warning">
                            <FaFutbol />
                          </span>
                          <Form.Control
                            type="number"
                            min="0"
                            value={formData.home_score}
                            onChange={(e) => setFormData({...formData, home_score: e.target.value})}
                            placeholder="Gol"
                            className="bg-dark text-white border-warning custom-placeholder"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white">{currentMatch.away_team}</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-dark border-warning text-warning">
                            <FaFutbol />
                          </span>
                          <Form.Control
                            type="number"
                            min="0"
                            value={formData.away_score}
                            onChange={(e) => setFormData({...formData, away_score: e.target.value})}
                            placeholder="Gol"
                            className="bg-dark text-white border-warning custom-placeholder"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row className="mt-4">
                    <Col xs={12}>
                      <div className="d-flex justify-content-center gap-3">
                        <Button 
                          variant="secondary" 
                          onClick={() => setShowEditModal(false)}
                          size="sm"
                          className="px-3 py-2"
                        >
                          <FaTimes className="me-1" />
                          Annulla
                        </Button>
                        <Button 
                          variant="warning" 
                          onClick={handleSaveResult}
                          size="sm"
                          className="px-3 py-2"
                        >
                          <FaSave className="me-1" />
                          Salva
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminResults;