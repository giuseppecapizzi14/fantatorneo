import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getCalendarMatches } from '../services/api';

const CalendarResults = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await getCalendarMatches();
        setMatches(response.data);
      } catch (err) {
        setError('Errore nel caricamento delle partite');
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Data da definire';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // Capitalizza la prima lettera di ogni parola (giorno e mese)
    return formattedDate.replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTeamLogo = (teamName) => {
    return `/logos/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
  };

  const TeamDisplay = ({ teamName, isHome = true }) => {
    const logoSrc = getTeamLogo(teamName);
    
    return (
      <div className="d-flex align-items-center" style={{ 
        minWidth: '120px',
        justifyContent: isHome ? 'flex-end' : 'flex-start',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}>
        {isHome ? (
          // Squadra di casa: logo e nome allineati a destra
          <>
            <img 
              src={logoSrc} 
              alt={`${teamName} logo`}
              style={{
                width: '20px',
                height: '20px',
                marginRight: '6px',
                objectFit: 'contain',
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'normal',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}>{teamName}</span>
          </>
        ) : (
          // Squadra ospite: nome e logo allineati a sinistra
          <>
            <span style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'normal',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}>{teamName}</span>
            <img 
              src={logoSrc} 
              alt={`${teamName} logo`}
              style={{
                width: '20px',
                height: '20px',
                marginLeft: '6px',
                objectFit: 'contain',
                flexShrink: 0
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

  // Raggruppa le partite per data
  const groupMatchesByDate = (matches) => {
    const grouped = {};
    matches.forEach(match => {
      const dateKey = match.match_date ? new Date(match.match_date).toDateString() : 'no-date';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Caricamento calendario...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Errore</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  const groupedMatches = groupMatchesByDate(matches);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          
          .calendar-container * {
            font-family: 'Montserrat', sans-serif !important;
          }
          
          .calendar-card {
            margin-bottom: 1rem !important;
          }
          
          .calendar-card .card-body {
            padding: 0.5rem !important;
          }
          
          .match-row {
            padding: 0.75rem !important;
            min-height: auto !important;
          }
          
          @media (max-width: 768px) {
            .time-group {
              min-width: 60px !important;
              flex-shrink: 0 !important;
            }
            .match-content {
              flex: 1 !important;
              justify-content: center !important;
              max-width: 280px !important;
            }
            .calendar-card {
              margin-bottom: 0.75rem !important;
              margin-left: 0.5rem !important;
              margin-right: 0.5rem !important;
            }
            .match-row {
              padding: 0.5rem !important;
              font-size: 0.85rem !important;
            }
            .team-display {
              min-width: 80px !important;
            }
            .team-name {
              font-size: 0.8rem !important;
              max-width: 70px !important;
            }
            .score-badge {
              font-size: 0.8rem !important;
              padding: 0.3rem 0.6rem !important;
            }
            .vs-text {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>
      <Container className="mt-4 calendar-container">
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-center mb-5">
              <FaCalendarAlt className="me-2" size={24} style={{ color: 'rgb(255, 208, 0)' }} />
              <h3 className="mb-0" style={{ 
                color: 'rgb(255, 208, 0)', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontWeight: '600'
              }}>
                CALENDARIO E RISULTATI
              </h3>
            </div>
            
            {matches.length === 0 ? (
              <Alert variant="info">
                <Alert.Heading>Nessuna partita</Alert.Heading>
                <p>Non ci sono partite programmate al momento.</p>
              </Alert>
            ) : (
              Object.entries(groupedMatches).map(([dateKey, dayMatches]) => (
                <Card 
                  key={dateKey}
                  className="calendar-card shadow"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.25)'
                  }}
                >
                  <Card.Header 
                    className="text-center"
                    style={{
                      backgroundColor: 'rgba(255, 208, 0, 0.2)',
                      border: 'none',
                      borderRadius: '12px 12px 0 0',
                      padding: '0.75rem'
                    }}
                  >
                    <h6 className="mb-0" style={{ 
                      color: 'white', 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      {dateKey !== 'no-date' ? formatDate(dayMatches[0].match_date) : 'Data da definire'}
                    </h6>
                  </Card.Header>
                  
                  <Card.Body style={{ padding: '0' }}>
                    {dayMatches.map((match, index) => (
                      <div 
                        key={match.id}
                        className="d-flex align-items-center match-row"
                        style={{
                          borderBottom: index < dayMatches.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          color: 'white'
                        }}
                      >
                        <div className="d-flex align-items-center time-group" style={{ minWidth: '120px' }}>
                          <div className="d-flex align-items-center">
                            <FaClock className="me-1" size={12} style={{ color: 'rgb(255, 208, 0)' }} />
                            <span style={{ fontSize: '0.8rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                              {formatTime(match.match_date) || 'TBD'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center justify-content-between match-content" style={{ 
                          flex: '1',
                          maxWidth: '350px',
                          margin: '0 auto'
                        }}>
                          <div style={{ flex: '1', textAlign: 'right', paddingRight: '10px' }}>
                            <div className="d-flex align-items-center team-display" style={{ 
                              minWidth: '100px',
                              justifyContent: 'flex-end',
                              whiteSpace: 'nowrap'
                            }}>
                              <img 
                                src={getTeamLogo(match.home_team)} 
                                alt={`${match.home_team} logo`}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  marginRight: '5px',
                                  objectFit: 'contain',
                                  flexShrink: 0
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="team-name" style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 'normal',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '80px'
                              }}>{match.home_team}</span>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center justify-content-center" style={{ minWidth: '60px' }}>
                            {match.home_score !== null && match.away_score !== null ? (
                              <Badge 
                                className="score-badge"
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  padding: '0.3rem 0.6rem',
                                  fontWeight: 'bold',
                                  border: 'none'
                                }}
                              >
                                {match.home_score} - {match.away_score}
                              </Badge>
                            ) : (
                              <span className="vs-text" style={{ 
                                color: 'rgb(255, 208, 0)',
                                fontSize: '0.9rem',
                                fontWeight: 'normal',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                              }}>
                                VS
                              </span>
                            )}
                          </div>
                          
                          <div style={{ flex: '1', textAlign: 'left', paddingLeft: '10px' }}>
                            <div className="d-flex align-items-center team-display" style={{ 
                              minWidth: '100px',
                              justifyContent: 'flex-start',
                              whiteSpace: 'nowrap'
                            }}>
                              <span className="team-name" style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 'normal',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '80px'
                              }}>{match.away_team}</span>
                              <img 
                                src={getTeamLogo(match.away_team)} 
                                alt={`${match.away_team} logo`}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  marginLeft: '5px',
                                  objectFit: 'contain',
                                  flexShrink: 0
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CalendarResults;