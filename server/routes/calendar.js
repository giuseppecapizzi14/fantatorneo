const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all calendar matches (PUBLIC - no auth required)
router.get('/matches', async (req, res) => {
  try {
    const matches = await pool.query(
      'SELECT * FROM calendar_matches ORDER BY match_date ASC, group_number, id'
    );
    res.json(matches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoints for managing calendar matches
router.post('/matches', [auth, admin], async (req, res) => {
  try {
    const { home_team, away_team, match_date, venue, group_number } = req.body;
    
    const newMatch = await pool.query(
      'INSERT INTO calendar_matches (home_team, away_team, match_date, venue, group_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [home_team, away_team, match_date, venue, group_number]
    );
    
    res.json(newMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/matches/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const { home_team, away_team, match_date, venue, home_score, away_score, group_number } = req.body;
    
    const updatedMatch = await pool.query(
      'UPDATE calendar_matches SET home_team = $1, away_team = $2, match_date = $3, venue = $4, home_score = $5, away_score = $6, group_number = $7 WHERE id = $8 RETURNING *',
      [home_team, away_team, match_date, venue, home_score, away_score, group_number, id]
    );
    
    if (updatedMatch.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(updatedMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/matches/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMatch = await pool.query(
      'DELETE FROM calendar_matches WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (deletedMatch.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;