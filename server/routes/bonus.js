const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all matchdays
router.get('/matchdays', auth, async (req, res) => {
  try {
    const matchdays = await pool.query('SELECT * FROM matchdays ORDER BY number');
    res.json(matchdays.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matchday by ID
router.get('/matchdays/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const matchday = await pool.query('SELECT * FROM matchdays WHERE id = $1', [id]);
    
    if (matchday.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }
    
    // Get player bonuses for this matchday
    const bonuses = await pool.query(`
      SELECT pb.*, p.name as player_name, p.position 
      FROM player_bonuses pb 
      JOIN players p ON pb.player_id = p.id 
      WHERE pb.matchday_id = $1
    `, [id]);
    
    res.json({
      ...matchday.rows[0],
      bonuses: bonuses.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create matchday (admin only)
router.post('/matchdays', [auth, admin], async (req, res) => {
  try {
    const { number, name } = req.body;
    
    // Check if matchday number already exists
    const matchdayCheck = await pool.query(
      'SELECT * FROM matchdays WHERE number = $1',
      [number]
    );
    
    if (matchdayCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Matchday number already exists' });
    }
    
    const newMatchday = await pool.query(
      'INSERT INTO matchdays (number, name) VALUES ($1, $2) RETURNING *',
      [number, name]
    );
    
    res.status(201).json(newMatchday.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/update player bonuses for a matchday (admin only)
router.post('/matchdays/:id/bonuses', [auth, admin], async (req, res) => {
  try {
    const matchdayId = req.params.id;
    const { bonuses, updateLeaderboard } = req.body;
    
    // Log received data for debugging
    console.log(`Received bonus update for matchday ${matchdayId}:`, bonuses);
    
    // Validate input
    if (!bonuses || !Array.isArray(bonuses) || bonuses.length === 0) {
      return res.status(400).json({ message: 'Invalid bonuses data' });
    }
    
    // Check if matchday exists
    const matchdayCheck = await pool.query(
      'SELECT * FROM matchdays WHERE id = $1',
      [matchdayId]
    );
    
    if (matchdayCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Process each bonus
      for (const bonus of bonuses) {
        const { playerId, points, updateTeams } = bonus;
        
        // Validate bonus data
        if (!playerId || points === undefined || points === null) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            message: 'Invalid bonus data', 
            details: `Invalid data for player ${playerId}: points=${points}` 
          });
        }
        
        // Check if player exists
        const playerCheck = await client.query(
          'SELECT * FROM players WHERE id = $1',
          [playerId]
        );
        
        if (playerCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: `Player with ID ${playerId} not found` });
        }
        
        // Check if bonus already exists for this player and matchday
        const existingBonus = await client.query(
          'SELECT * FROM player_bonuses WHERE player_id = $1 AND matchday_id = $2',
          [playerId, matchdayId]
        );
        
        if (existingBonus.rows.length > 0) {
          // Update existing bonus
          await client.query(
            'UPDATE player_bonuses SET points = $1 WHERE player_id = $2 AND matchday_id = $3',
            [points, playerId, matchdayId]
          );
        } else {
          // Insert new bonus
          await client.query(
            'INSERT INTO player_bonuses (player_id, matchday_id, points) VALUES ($1, $2, $3)',
            [playerId, matchdayId, points]
          );
        }
        
        // Update player's total points
        await client.query(
          `UPDATE players 
           SET total_points = (
             SELECT COALESCE(SUM(points), 0) 
             FROM player_bonuses 
             WHERE player_id = $1
           ) 
           WHERE id = $1`,
          [playerId]
        );
        
        // Se richiesto, aggiorna i punteggi delle squadre che contengono questo giocatore
        if (updateTeams) {
          // Trova tutte le squadre che contengono questo giocatore
          const teamsWithPlayer = await client.query(
            'SELECT team_id FROM team_players WHERE player_id = $1',
            [playerId]
          );
          
          // Per ogni squadra, aggiorna il punteggio totale
          for (const teamRow of teamsWithPlayer.rows) {
            await client.query(
              `UPDATE teams 
               SET total_points = (
                 SELECT COALESCE(SUM(p.total_points), 0) 
                 FROM team_players tp 
                 JOIN players p ON tp.player_id = p.id 
                 WHERE tp.team_id = $1
               ) 
               WHERE id = $1`,
              [teamRow.team_id]
            );
          }
        }
      }
      
      // Se richiesto, aggiorna la classifica generale
      if (updateLeaderboard) {
        // Aggiorna i punteggi di tutte le squadre
        await client.query(
          `UPDATE teams 
           SET total_points = (
             SELECT COALESCE(SUM(p.total_points), 0) 
             FROM team_players tp 
             JOIN players p ON tp.player_id = p.id 
             WHERE tp.team_id = teams.id
           )`
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ 
        message: 'Bonuses updated successfully',
        teamsUpdated: true,
        leaderboardUpdated: updateLeaderboard || false
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error updating bonuses:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// Delete matchday (admin only)
router.delete('/matchdays/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if matchday exists
    const matchdayCheck = await pool.query(
      'SELECT * FROM matchdays WHERE id = $1',
      [id]
    );
    
    if (matchdayCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get all bonuses for this matchday to subtract points
      const bonuses = await client.query(
        'SELECT * FROM player_bonuses WHERE matchday_id = $1',
        [id]
      );
      
      // Subtract points from players
      for (const bonus of bonuses.rows) {
        await client.query(
          'UPDATE players SET total_points = total_points - $1 WHERE id = $2',
          [bonus.points, bonus.player_id]
        );
      }
      
      // Delete bonuses
      await client.query('DELETE FROM player_bonuses WHERE matchday_id = $1', [id]);
      
      // Delete matchday
      await client.query('DELETE FROM matchdays WHERE id = $1', [id]);
      
      // Update team total points
      await client.query(`
        UPDATE teams t
        SET total_points = (
          SELECT COALESCE(SUM(p.total_points), 0)
          FROM team_players tp
          JOIN players p ON tp.player_id = p.id
          WHERE tp.team_id = t.id
        )
      `);
      
      await client.query('COMMIT');
      
      res.json({ message: 'Matchday deleted successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all players with their bonuses for a specific matchday (admin only)
router.get('/matchdays/:id/players', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if matchday exists
    const matchdayCheck = await pool.query(
      'SELECT * FROM matchdays WHERE id = $1',
      [id]
    );
    
    if (matchdayCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }
    
    // Get all players with their bonuses for this matchday
    const players = await pool.query(`
      SELECT p.*, COALESCE(pb.points, 0) as matchday_points
      FROM players p
      LEFT JOIN player_bonuses pb ON p.id = pb.player_id AND pb.matchday_id = $1
      ORDER BY p.name
    `, [id]);
    
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a specific player's bonus for a matchday (admin only)
router.delete('/matchdays/:id/bonuses/:playerId', [auth, admin], async (req, res) => {
  try {
    const { id: matchdayId, playerId } = req.params;
    
    // Check if matchday exists
    const matchdayCheck = await pool.query(
      'SELECT * FROM matchdays WHERE id = $1',
      [matchdayId]
    );
    
    if (matchdayCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Matchday not found' });
    }
    
    // Check if player exists
    const playerCheck = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [playerId]
    );
    
    if (playerCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get the current bonus value
      const currentBonus = await client.query(
        'SELECT points FROM player_bonuses WHERE player_id = $1 AND matchday_id = $2',
        [playerId, matchdayId]
      );
      
      if (currentBonus.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Bonus not found' });
      }
      
      const bonusPoints = currentBonus.rows[0].points;
      
      // Delete the bonus
      await client.query(
        'DELETE FROM player_bonuses WHERE player_id = $1 AND matchday_id = $2',
        [playerId, matchdayId]
      );
      
      // Update player's total points
      await client.query(
        `UPDATE players 
         SET total_points = (
           SELECT COALESCE(SUM(points), 0) 
           FROM player_bonuses 
           WHERE player_id = $1
         ) 
         WHERE id = $1`,
        [playerId]
      );
      
      // Update teams' total points
      await client.query(`
        UPDATE teams t
        SET total_points = (
          SELECT COALESCE(SUM(p.total_points), 0)
          FROM team_players tp
          JOIN players p ON tp.player_id = p.id
          WHERE tp.team_id = t.id
        )
      `);
      
      await client.query('COMMIT');
      
      res.json({ 
        message: 'Bonus deleted successfully',
        deletedPoints: bonusPoints
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error deleting bonus:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

module.exports = router;