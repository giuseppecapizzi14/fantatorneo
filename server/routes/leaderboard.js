const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Get leaderboard (all teams sorted by total points)
router.get('/', auth, async (req, res) => {
  try {
    const leaderboard = await pool.query(`
      SELECT t.id, t.name, t.total_points, u.username as owner_username 
      FROM teams t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.total_points DESC
    `);
    
    res.json(leaderboard.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed leaderboard with team players
router.get('/detailed', auth, async (req, res) => {
  try {
    // Get all teams with their total points
    const teams = await pool.query(`
      SELECT t.id, t.name, t.total_points, u.username as owner_username 
      FROM teams t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.total_points DESC
    `);
    
    // For each team, get its players
    const detailedLeaderboard = [];
    
    for (const team of teams.rows) {
      const players = await pool.query(`
        SELECT p.id, p.name, p.position, p.total_points, tp.is_goalkeeper 
        FROM team_players tp 
        JOIN players p ON tp.player_id = p.id 
        WHERE tp.team_id = $1
      `, [team.id]);
      
      detailedLeaderboard.push({
        ...team,
        players: players.rows
      });
    }
    
    res.json(detailedLeaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;