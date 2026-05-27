import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getCalendarMatches } from '../services/api';
import { getTeamLogoSrc } from '../utils/teamLogos';

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
      day: 'numeric',
      timeZone: 'Europe/Rome' // ← AGGIUNTO: forza timezone italiano
    });
    return formattedDate.replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome' // ← AGGIUNTO: forza timezone italiano
    });
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
  const dayEntries = Object.entries(groupedMatches).sort(([a], [b]) => {
    if (a === 'no-date' && b === 'no-date') return 0;
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const groupMatchesByTime = (dayMatches) => {
    const grouped = {};
    dayMatches.forEach((match) => {
      const timeKey = formatTime(match.match_date) || 'TBD';
      if (!grouped[timeKey]) grouped[timeKey] = [];
      grouped[timeKey].push(match);
    });

    const parseTime = (timeKey) => {
      if (timeKey === 'TBD') return Number.POSITIVE_INFINITY;
      const [h, m] = String(timeKey).split(':').map((v) => parseInt(v, 10));
      if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
      return Number.POSITIVE_INFINITY;
    };

    return Object.entries(grouped).sort(([a], [b]) => parseTime(a) - parseTime(b));
  };

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center justify-content-center mb-4">
        <FaCalendarAlt className="me-2 text-warning" size={22} />
        <h2 className="mb-0 text-warning app-title">Calendario & Risultati</h2>
      </div>

      {matches.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Nessuna partita</Alert.Heading>
          <p className="mb-0">Non ci sono partite programmate al momento.</p>
        </Alert>
      ) : (
        <Card className="admin-card calendar-card">
          <Card.Body className="calendar-card-body">
            {dayEntries.map(([dateKey, dayMatches], dayIndex) => (
              <div key={dateKey} className={dayIndex === 0 ? 'calendar-day' : 'calendar-day calendar-day--spaced'}>
                <div className="calendar-day-header">
                  {dateKey !== 'no-date' ? formatDate(dayMatches[0].match_date) : 'Data da definire'}
                </div>

                {groupMatchesByTime(dayMatches).map(([timeKey, timeMatches], timeIndex) => (
                  <div key={`${dateKey}-${timeKey}`} className={timeIndex === 0 ? 'calendar-time-group' : 'calendar-time-group calendar-time-group--spaced'}>
                    <div className="calendar-time-group-header">
                      <FaClock className="calendar-time-group-icon" size={12} />
                      <span className="calendar-time-group-text">{timeKey}</span>
                    </div>

                    <div className="calendar-time-group-list">
                      {timeMatches.map((match, index) => {
                        const hasScore = match.home_score !== null && match.away_score !== null;
                        return (
                          <div
                            key={match.id}
                            className={index < timeMatches.length - 1 ? 'calendar-match-row calendar-match-row--divider' : 'calendar-match-row'}
                          >
                            <img
                              src={getTeamLogoSrc(match.home_team) || ''}
                              alt=""
                              className="calendar-side-logo calendar-side-logo--left"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />

                            <div className="calendar-side-name calendar-side-name--left">{match.home_team}</div>

                            <div className="calendar-center">
                              {hasScore ? (
                                <Badge bg="warning" className="text-dark app-badge calendar-score-badge">
                                  {match.home_score} - {match.away_score}
                                </Badge>
                              ) : (
                                <span className="calendar-vs">VS</span>
                              )}
                            </div>

                            <div className="calendar-side-name calendar-side-name--right">{match.away_team}</div>

                            <img
                              src={getTeamLogoSrc(match.away_team) || ''}
                              alt=""
                              className="calendar-side-logo calendar-side-logo--right"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CalendarResults;
