const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all teams
router.get('/', auth, async (req, res) => {
  try {
    // Log per debug
    console.log('GET /api/teams request received');
    
    const teams = await pool.query(`
      SELECT t.*, u.username as owner_username 
      FROM teams t 
      JOIN users u ON t.user_id = u.id
    `);
    
    // Log per debug
    console.log(`Found ${teams.rows.length} teams`);
    
    res.json(teams.rows);
  } catch (err) {
    console.error('Error fetching teams:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await pool.query(`
      SELECT t.*, u.username as owner_username 
      FROM teams t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.id = $1
    `, [id]);
    
    if (team.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get team players
    const players = await pool.query(`
      SELECT p.*, tp.is_goalkeeper 
      FROM team_players tp 
      JOIN players p ON tp.player_id = p.id 
      WHERE tp.team_id = $1
    `, [id]);
    
    // Log per debug
    console.log(`Team ${id} players:`, players.rows);
    
    // Assicuriamoci di restituire sempre un array players, anche se vuoto
    res.json({
      ...team.rows[0],
      players: players.rows || []
    });
  } catch (err) {
    console.error('Error fetching team details:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's team
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Regular users can only access their own team
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Use PostgreSQL query instead of Mongoose
    const team = await pool.query('SELECT * FROM teams WHERE user_id = $1', [userId]);
    
    if (team.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found for this user' });
    }
    
    // Get team players
    const players = await pool.query(`
      SELECT p.*, tp.is_goalkeeper 
      FROM team_players tp 
      JOIN players p ON tp.player_id = p.id 
      WHERE tp.team_id = $1
    `, [team.rows[0].id]);
    
    res.json({
      ...team.rows[0],
      players: players.rows
    });
  } catch (err) {
    console.error('Error fetching user teams:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team
router.post('/', auth, async (req, res) => {
  try {
    const { name, playerIds } = req.body;
    
    // Log per debug
    console.log('Received team data:', { name, playerIds });
    
    // Validazione dei dati
    if (!name || !playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({ message: 'Dati della squadra non validi' });
    }
    
    const userId = req.user.id;
    
    // Verifica se l'utente ha già una squadra
    const existingTeam = await pool.query(
      'SELECT * FROM teams WHERE user_id = $1',
      [userId]
    );
    
    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ message: 'L\'utente ha già una squadra' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Crea la squadra
      const newTeam = await client.query(
        'INSERT INTO teams (name, user_id, total_points) VALUES ($1, $2, 0) RETURNING *',
        [name, userId]
      );
      
      const teamId = newTeam.rows[0].id;
      
      // Aggiungi i giocatori alla squadra
      for (const playerId of playerIds) {
        // Skip null or undefined playerIds
        if (!playerId) {
          console.warn('Skipping null or undefined player ID');
          continue;
        }
        
        // Ottieni informazioni sul giocatore
        const playerInfo = await client.query(
          'SELECT * FROM players WHERE id = $1',
          [playerId]
        );
        
        if (playerInfo.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: `Giocatore con ID ${playerId} non trovato` });
        }
        
        const isGoalkeeper = playerInfo.rows[0].position === 'Portiere';
        
        // Inserisci nella tabella team_players
        await client.query(
          'INSERT INTO team_players (team_id, player_id, is_goalkeeper) VALUES ($1, $2, $3)',
          [teamId, playerId, isGoalkeeper]
        );
      }
      
      await client.query('COMMIT');
      
      // Ottieni i dati completi della squadra con i giocatori
      const teamWithPlayers = await pool.query(`
        SELECT t.*, u.username as owner_username 
        FROM teams t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.id = $1
      `, [teamId]);
      
      const players = await pool.query(`
        SELECT p.*, tp.is_goalkeeper 
        FROM team_players tp 
        JOIN players p ON tp.player_id = p.id 
        WHERE tp.team_id = $1
      `, [teamId]);
      
      res.status(201).json({
        ...teamWithPlayers.rows[0],
        players: players.rows
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Team creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, user_id, players } = req.body;
    
    // Check if team exists
    const teamCheck = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );
    
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update team
      const updatedTeam = await client.query(
        'UPDATE teams SET name = $1, user_id = $2 WHERE id = $3 RETURNING *',
        [name, user_id, id]
      );
      
      // If players are provided, update team players
      if (players) {
        // Validate team composition
        if (players.length !== 5) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Team must have exactly 5 players' });
        }
        
        // Check if there's exactly 1 goalkeeper
        const goalkeepers = players.filter(p => p.is_goalkeeper);
        if (goalkeepers.length !== 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Team must have exactly 1 goalkeeper' });
        }
        
        // Get player prices to calculate total cost
        const playerIds = players.map(p => p.id);
        const playersData = await client.query(
          'SELECT id, price FROM players WHERE id = ANY($1)',
          [playerIds]
        );
        
        // Create a map of player prices
        const playerPrices = {};
        playersData.rows.forEach(p => {
          playerPrices[p.id] = p.price;
        });
        
        // Calculate total cost
        const totalCost = players.reduce((sum, player) => sum + (playerPrices[player.id] || 0), 0);
        
        // Check if total cost exceeds budget
        if (totalCost > 250) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Team cost exceeds budget of 250 credits' });
        }
        
        // Remove existing players
        await client.query('DELETE FROM team_players WHERE team_id = $1', [id]);
        
        // Add new players
        for (const player of players) {
          await client.query(
            'INSERT INTO team_players (team_id, player_id, is_goalkeeper) VALUES ($1, $2, $3)',
            [id, player.id, player.is_goalkeeper]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        ...updatedTeam.rows[0],
        players: players || []
      });
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

// Delete team (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if team exists
    const teamCheck = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [id]
    );
    
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete team players
      await client.query('DELETE FROM team_players WHERE team_id = $1', [id]);
      
      // Delete team
      await client.query('DELETE FROM teams WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      res.json({ message: 'Team deleted successfully' });
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

module.exports = router;