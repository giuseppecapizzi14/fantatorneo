const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all players
router.get('/', auth, async (req, res) => {
  try {
    const players = await pool.query('SELECT * FROM players ORDER BY name');
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
    
    if (player.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json(player.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create player (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, position, price } = req.body;
    
    const newPlayer = await pool.query(
      'INSERT INTO players (name, position, price, total_points) VALUES ($1, $2, $3, 0) RETURNING *',
      [name, position, price]
    );
    
    res.status(201).json(newPlayer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update player (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, price } = req.body;
    
    // Check if player exists
    const playerCheck = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [id]
    );
    
    if (playerCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Update player
    const updatedPlayer = await pool.query(
      'UPDATE players SET name = $1, position = $2, price = $3 WHERE id = $4 RETURNING *',
      [name, position, price, id]
    );
    
    res.json(updatedPlayer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete player (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if player exists
    const playerCheck = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [id]
    );
    
    if (playerCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player is part of any team
    const teamCheck = await pool.query(
      'SELECT * FROM team_players WHERE player_id = $1',
      [id]
    );
    
    if (teamCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete player that is part of a team' });
    }
    
    // Delete player
    await pool.query('DELETE FROM players WHERE id = $1', [id]);
    
    res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;