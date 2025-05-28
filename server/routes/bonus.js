const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all matches
router.get('/matches', auth, async (req, res) => {
  try {
    const matches = await pool.query('SELECT * FROM matches ORDER BY group_number, id');
    res.json(matches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get match by ID
router.get('/matches/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await pool.query('SELECT * FROM matches WHERE id = $1', [id]);
    
    if (match.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Get player bonuses for this match
    const bonuses = await pool.query(`
      SELECT pb.*, p.name as player_name, p.position 
      FROM player_bonuses pb 
      JOIN players p ON pb.player_id = p.id 
      WHERE pb.match_id = $1
    `, [id]);
    
    res.json({
      ...match.rows[0],
      bonuses: bonuses.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create match (admin only)
router.post('/matches', [auth, admin], async (req, res) => {
  try {
    const { home_team, away_team, group_number } = req.body;
    
    // Check if match already exists
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE home_team = $1 AND away_team = $2',
      [home_team, away_team]
    );
    
    if (matchCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Match already exists' });
    }
    
    const newMatch = await pool.query(
      'INSERT INTO matches (home_team, away_team, group_number) VALUES ($1, $2, $3) RETURNING *',
      [home_team, away_team, group_number]
    );
    
    res.status(201).json(newMatch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/update player bonuses for a match (admin only)
router.post('/matches/:id/bonuses', [auth, admin], async (req, res) => {
  try {
    const matchId = req.params.id;
    const { bonuses, updateLeaderboard } = req.body;
    
    // Log received data for debugging
    console.log(`Received bonus update for match ${matchId}:`, bonuses);
    
    // Validate input
    if (!bonuses || !Array.isArray(bonuses) || bonuses.length === 0) {
      return res.status(400).json({ message: 'Invalid bonuses data' });
    }
    
    // Check if match exists
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [matchId]
    );
    
    if (matchCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
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
        
        // Check if bonus already exists for this player and match
        const existingBonus = await client.query(
          'SELECT * FROM player_bonuses WHERE player_id = $1 AND match_id = $2',
          [playerId, matchId]
        );
        
        if (existingBonus.rows.length > 0) {
          // Update existing bonus
          await client.query(
            'UPDATE player_bonuses SET points = $1 WHERE player_id = $2 AND match_id = $3',
            [points, playerId, matchId]
          );
        } else {
          // Insert new bonus
          await client.query(
            'INSERT INTO player_bonuses (player_id, match_id, points) VALUES ($1, $2, $3)',
            [playerId, matchId, points]
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

// Delete match (admin only)
router.delete('/matches/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if match exists
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [id]
    );
    
    if (matchCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get all bonuses for this match to subtract points
      const bonuses = await client.query(
        'SELECT * FROM player_bonuses WHERE match_id = $1',
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
      await client.query('DELETE FROM player_bonuses WHERE match_id = $1', [id]);
      
      // Delete match
      await client.query('DELETE FROM matches WHERE id = $1', [id]);
      
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
      
      res.json({ message: 'Match deleted successfully' });
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

// Get all players with their bonuses for a specific match (admin only)
router.get('/matches/:id/players', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if match exists
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [id]
    );
    
    if (matchCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Get all players with their bonuses for this match
    const players = await pool.query(`
      SELECT p.*, COALESCE(pb.points, 0) as match_points
      FROM players p
      LEFT JOIN player_bonuses pb ON p.id = pb.player_id AND pb.match_id = $1
      ORDER BY p.name
    `, [id]);
    
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a specific player's bonus for a match (admin only)
router.delete('/matches/:id/bonuses/:playerId', [auth, admin], async (req, res) => {
  try {
    const { id: matchId, playerId } = req.params;
    
    // Check if match exists
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [matchId]
    );
    
    if (matchCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
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
        'SELECT points FROM player_bonuses WHERE player_id = $1 AND match_id = $2',
        [playerId, matchId]
      );
      
      if (currentBonus.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Bonus not found' });
      }
      
      const bonusPoints = currentBonus.rows[0].points;
      
      // Delete the bonus
      await client.query(
        'DELETE FROM player_bonuses WHERE player_id = $1 AND match_id = $2',
        [playerId, matchId]
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